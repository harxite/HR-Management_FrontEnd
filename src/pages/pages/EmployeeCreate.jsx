import React, { useState } from "react";
import { createEmployee, fetchEmployees } from "../api/api";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-number-input/input";
import { uploadPhotoAndGetPath } from "../api/api";
import { checkEmailExists } from "../api/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchEmployees2 } from "../api/api";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const EmployeeCreate = () => {
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState({
    firstName: "",
    secondName: "",
    firstSurname: "",
    secondSurname: "",
    phoneNumber: "",
    dateOfBirth: "",
    birthPlace: "",
    tc: "",
    address: "",
    company: "",
    position: "",
    startDate: "",
    wage: "",
    isActive: true,
    department: "",
    email: "deneme@bilgeadam.com",
    imagePath: "",
    gender: "",
  });

  const [photo, setPhoto] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData({ ...employeeData, [name]: value });
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setPhoto(URL.createObjectURL(file));
    handlePhotoChange(file);
  };

  const handlePhotoChange = async (file) => {
    try {
      const allowedExtensions = ["jpg", "jpeg", "png"];
      const fileExtension = file.name.split(".").pop().toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        toast.warning("Sadece jpg ve png dosyaları kabul edilir!");
        return;
      }

      const uploadedFileResponse = await uploadPhotoAndGetPath(file);
      const fileName = uploadedFileResponse.fileName;
      console.log("Dosya adı:", fileName);

      setEmployeeData({ ...employeeData, imagePath: fileName });
      toast.success("Fotoğraf başarıyla yüklendi");
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Fotoğraf yüklenirken bir hata oluştu.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);

    if (employeeData.phoneNumber.length !== 13) {
      toast.warning("Lütfen geçerli bir telefon numarası giriniz.");
      return;
    }

    const tcValidationResult = validateTcNumber(employeeData.tc);
    if (!tcValidationResult.valid) {
      toast.warning(tcValidationResult.message);
      return;
    }

    if (!validateAddress(employeeData.address)) {
      toast.warning("Adres en az bir harf ve bir rakam içermelidir.");
      return;
    }

    const minWage = 17002;
    if (parseInt(employeeData.wage) < minWage) {
      toast.warning("Maaş asgari ücretin altında olamaz.");
      return;
    }

    if (!photo) {
      toast.warning("Lütfen bir fotoğraf seçiniz.");
      return;
    }

    try {
      const employeeList = await fetchEmployees2();
      const existingManager = employeeList.find(
        (employee) =>
          employee.firstName === employeeData.firstName &&
          employee.firstSurname === employeeData.firstSurname
      );
      if (existingManager) {
        toast.warning("Bu isim ve soyisimde bir çalışan zaten mevcut.");
        return;
      }

      console.log(employeeData);
      const confirmed = await showConfirmationDialog();
      if (confirmed) {
        const response = await createEmployee(employeeData);
        console.log("Employee created:", response, response.email);
        checkEmailExists(response.email);
        resetForm();
        toast.success("Kayıt onaylandı.");
        setTimeout(() => {
          navigate("/mng-employee-list");
        }, 2000);
      } else {
        console.log("Kaydetme işlemi iptal edildi.");
        toast.warning("Kaydetme işlemi iptal edildi.");
      }
    } catch (error) {
      console.error("Error creating employee:", error);
      toast.error("Kaydetme işlemi başarısız oldu.");
    }
  };

  const validateAddress = (address) => {
    return !/^\d+$/.test(address);
  };

  const validateForm = () => {
    for (const key in employeeData) {
      if (
        employeeData.hasOwnProperty(key) &&
        key !== "secondName" &&
        key !== "secondSurname"
      ) {
        if (!employeeData[key]) {
          return false;
        }
      }
    }
    return true;
  };

  const resetForm = () => {
    setEmployeeData({
      firstName: "",
      secondName: "",
      firstSurname: "",
      secondSurname: "",
      phoneNumber: "",
      DateOfBirth: "",
      birthPlace: "",
      tc: "",
      address: "",
      company: "",
      department: "",
      position: "",
      startDate: "",
      wage: "",
      isActive: true,
      email: "",
      imagepath: "",
      gender: "",
    });
    setPhoto(null);
    setFormSubmitted(false);
  };

  const validateTcNumber = (tc) => {
    if (!tc || tc.length !== 11 || isNaN(tc)) {
      return {
        valid: false,
        message: "Geçerli bir T.C. kimlik numarası giriniz....",
      };
    }

    const digits = Array.from(tc, Number);

    const [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11] = digits;
    const total = (t1 + t3 + t5 + t7 + t9) * 7 - (t2 + t4 + t6 + t8);
    const total2 = t1 + t2 + t3 + t4 + t5 + t6 + t7 + t8 + t9 + t10;
    if (
      total2 % 10 !== t11 ||
      total % 10 !== t10 ||
      (t1 === t2 &&
        t2 === t3 &&
        t3 === t4 &&
        t4 === t5 &&
        t5 === t6 &&
        t6 === t7 &&
        t7 === t8 &&
        t8 === t9 &&
        t9 === t10)
    ) {
      return {
        valid: false,
        message: "Geçerli bir T.C. kimlik numarası giriniz.",
      };
    }

    return { valid: true, message: "" };
  };

  const handleDateOfBirthChange = (e) => {
    const selectedDate = e.target.value;
    const today = new Date();
    const minDate = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    )
      .toISOString()
      .split("T")[0];

    if (selectedDate > minDate) {
      toast.warning("Yaşınız 18'den küçük olamaz.");
      return;
    }

    setEmployeeData({ ...employeeData, dateOfBirth: selectedDate });
  };

  const showConfirmationDialog = () => {
    return new Promise((resolve) => {
      confirmAlert({
        title: "Onay",
        message: "Kaydetmeyi onaylıyor musunuz?",
        buttons: [
          {
            label: "Evet",
            onClick: () => resolve(true),
          },
          {
            label: "Hayır",
            onClick: () => resolve(false),
          },
        ],
      });
    });
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Çalışan Ekle</h2>
      <div className="row justify-content-center align-items-start">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="mb-3 d-flex align-items-center justify-content-center">
                <div
                  className="me-3 text-center"
                  style={{ width: "100px", height: "100px" }}
                >
                  <label
                    htmlFor="photo"
                    className="btn btn-light rounded-circle upload-btn"
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {photo ? (
                      <img
                        src={photo}
                        alt="Employee"
                        className="uploaded-photo"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "100%",
                          borderRadius: "50%",
                        }}
                      />
                    ) : (
                      "+"
                    )}
                  </label>
                  <input
                    type="file"
                    id="photo"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </div>
                <div>
                  <h5>
                    <span className="text-danger">*</span> Fotoğraf Seç
                  </h5>
                  <p>Fotoğraf ekleyin veya değiştirin </p>
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="firstName">
                  <span className="text-danger">*</span> Ad:
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={employeeData.firstName}
                  onChange={handleInputChange}
                  className="form-control mb-2"
                />
                {formSubmitted && !employeeData.firstName && (
                  <div className="text-danger">Adı boş bırakamazsınız.</div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="secondName">İkinci Ad:</label>
                <input
                  type="text"
                  id="secondName"
                  name="secondName"
                  value={employeeData.secondName}
                  onChange={handleInputChange}
                  className="form-control mb-2"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="firstSurname">
                  <span className="text-danger">*</span> Soyad:
                </label>
                <input
                  type="text"
                  id="firstSurname"
                  name="firstSurname"
                  value={employeeData.firstSurname}
                  onChange={handleInputChange}
                  className="form-control mb-2"
                />
                {formSubmitted && !employeeData.firstSurname && (
                  <div className="text-danger">Soyadı boş bırakamazsınız.</div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="secondSurname">İkinci Soyad:</label>
                <input
                  type="text"
                  id="secondSurname"
                  name="secondSurname"
                  value={employeeData.secondSurname}
                  onChange={handleInputChange}
                  className="form-control mb-2"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="phoneNumber">
                  <span className="text-danger">*</span> Telefon Numarası:
                </label>
                <PhoneInput
                  country="TR"
                  value={employeeData.phoneNumber}
                  onChange={(value) =>
                    setEmployeeData({ ...employeeData, phoneNumber: value })
                  }
                  className="form-control mb-2"
                  maxLength={13}
                />
                {formSubmitted && !employeeData.phoneNumber && (
                  <div className="text-danger">
                    Telefon numarası boş bırakılamaz.
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="dateOfBirth">
                  <span className="text-danger">*</span> Doğum Tarihi:
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={employeeData.dateOfBirth}
                  onChange={handleDateOfBirthChange}
                  className="form-control mb-2"
                  max={new Date().toISOString().split("T")[0]}
                />
                {formSubmitted && !employeeData.dateOfBirth && (
                  <div className="text-danger">
                    Doğum tarihi boş bırakılamaz.
                  </div>
                )}
              </div>

              {
                <div className="mb-3">
                  <label>
                    <span className="text-danger">*</span> Cinsiyet:
                  </label>
                  <div className="form-check">
                    <input
                      type="radio"
                      id="male"
                      name="gender"
                      value="Male"
                      checked={employeeData.gender === "Male"}
                      onChange={handleInputChange}
                      className="form-check-input"
                    />
                    <label htmlFor="male" className="form-check-label">
                      Erkek
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      type="radio"
                      id="female"
                      name="gender"
                      value="Female"
                      checked={employeeData.gender === "Female"}
                      onChange={handleInputChange}
                      className="form-check-input"
                    />
                    <label htmlFor="female" className="form-check-label">
                      Kadın
                    </label>
                  </div>
                  {formSubmitted && !employeeData.gender && (
                    <div className="text-danger">
                      Cinsiyet seçimi yapmalısınız.
                    </div>
                  )}
                </div>
              }
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="birthPlace">
                  <span className="text-danger">*</span> Doğum Yeri:
                </label>
                <input
                  type="text"
                  id="birthPlace"
                  name="birthPlace"
                  value={employeeData.birthPlace}
                  onChange={handleInputChange}
                  className="form-control mb-2"
                />
                {formSubmitted && !employeeData.birthPlace && (
                  <div className="text-danger">Doğum yeri boş bırakılamaz.</div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="tc">
                  <span className="text-danger">*</span> TC Kimlik No:
                </label>
                <input
                  type="text"
                  id="tc"
                  name="tc"
                  value={employeeData.tc}
                  onChange={handleInputChange}
                  className="form-control mb-2"
                />
                {formSubmitted && !employeeData.tc && (
                  <div className="text-danger">
                    TC kimlik numarası boş bırakılamaz.
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="address">
                  <span className="text-danger">*</span>Adres:
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={employeeData.address}
                  onChange={handleInputChange}
                  className="form-control mb-2"
                />
                {formSubmitted && !employeeData.address && (
                  <div className="text-danger">Adres boş bırakılamaz.</div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="company">
                  <span className="text-danger">*</span> Şirket Adı:
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={employeeData.company}
                  onChange={handleInputChange}
                  className="form-control mb-2"
                />
                {formSubmitted && !employeeData.company && (
                  <div className="text-danger">
                    Şirket adı boş bırakılamaz.{" "}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="position">
                  <span className="text-danger">*</span> Pozisyon:
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={employeeData.position}
                  onChange={handleInputChange}
                  className="form-control mb-2"
                />
                {formSubmitted && !employeeData.position && (
                  <div className="text-danger">Pozisyon boş bırakılamaz. </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="department">
                  <span className="text-danger">*</span> Departman:
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={employeeData.department}
                  onChange={handleInputChange}
                  className="form-control mb-2"
                />
                {formSubmitted && !employeeData.department && (
                  <div className="text-danger">Departman boş bırakılamaz.</div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="startDate">
                  <span className="text-danger">*</span> İşe Giriş Tarihi:
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={employeeData.startDate}
                  onChange={handleInputChange}
                  className="form-control mb-2"
                  max={new Date().toISOString().split("T")[0]}
                />
                {formSubmitted && !employeeData.startDate && (
                  <div className="text-danger">
                    İşe giriş tarihi boş bırakılamaz.
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="wage">
                  <span className="text-danger">*</span> Maaş:
                </label>
                <input
                  type="number"
                  id="wage"
                  name="wage"
                  value={employeeData.wage}
                  onChange={handleInputChange}
                  className="form-control mb-2"
                />
                {formSubmitted && !employeeData.wage && (
                  <div className="text-danger">
                    Maaş bilgisi boş bırakılamaz.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="text-center mt-3">
        <button
          type="submit"
          className="btn btn-primary btn-lg me-3"
          onClick={handleSubmit}
        >
          Kaydet
        </button>{" "}
        <button
          type="button"
          className="btn btn-secondary btn-lg"
          onClick={resetForm}
        >
          Temizle
        </button>
      </div>
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
    </div>
  );
};

export default EmployeeCreate;
