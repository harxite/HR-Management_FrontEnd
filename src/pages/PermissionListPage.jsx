import React, { useState, useEffect } from "react";
import {
  fetchAllPermission,
  updatePermissionStatusForEmployee,
} from "./api/api";
import { ToastContainer, toast } from "react-toastify";
import { downloadFile } from "./api/api";
import { updatePermissionStatus } from "./api/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortUp, faSortDown } from "@fortawesome/free-solid-svg-icons";
import "react-toastify/dist/ReactToastify.css";
import "react-confirm-alert/src/react-confirm-alert.css";
import { confirmAlert } from "react-confirm-alert";
import { useEmp } from "../components/EmployeeContext";
import Pagination from "react-bootstrap/Pagination";

function PermissionList() {
  const [permissions, setPermissions] = useState([]);
  const [sortedPermissions, setSortedPermissions] = useState([]);
  const [filterOption, setFilterOption] = useState("");
  const [sortDirection, setSortDirection] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [permissionsPerPage] = useState(10);
  const { empData, refreshData } = useEmp();

  const employeeId = localStorage.getItem("empId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchAllPermission(employeeId);
        if (
          response &&
          response.permissions &&
          Array.isArray(response.permissions)
        ) {
          setPermissions(response.permissions);
          setSortedPermissions(response.permissions.slice().reverse());
        } else {
          console.error("Invalid data format:", response);
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };

    fetchData();
  }, [employeeId]); // useEffect'i employeeId bağımlılığı ile kullanarak, employeeId değiştiğinde tekrar çağrılmasını sağlıyoruz

  const handleReject = async (id) => {
    try {
      const updateResult = await updatePermissionStatusForEmployee(id, false);
      if (updateResult.success) {
        toast.success(updateResult.message);
        // Güncel verileri tekrar çekerek state'lere atama
        const response = await fetchAllPermission(employeeId);
        if (
          response &&
          response.permissions &&
          Array.isArray(response.permissions)
        ) {
          setPermissions(response.permissions);
          setSortedPermissions(response.permissions.slice().reverse());
        } else {
          console.error("Invalid data format:", response);
        }
      } else {
        toast.error(updateResult.message);
      }
    } catch (error) {
      console.error("Error rejecting permission:", error);
      toast.error("İzin reddedilirken bir hata oluştu");
    }
  };

  const sortBy = (key) => {
    let direction = sortDirection[key] === "asc" ? "desc" : "asc";
    setSortDirection({ [key]: direction });

    const sorted = [...permissions].sort((a, b) => {
      if (key === "permissionType") {
        return direction === "asc"
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      } else {
        return direction === "asc"
          ? a[key] > b[key]
            ? 1
            : -1
          : a[key] < b[key]
          ? 1
          : -1;
      }
    });
    setSortedPermissions(sorted);
  };

  const handleDownload = async (fileName) => {
    try {
      await downloadFile(fileName);
      toast.success("Dosya başarıyla indirildi");
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error("Dosya indirme sırasında bir hata oluştu");
    }
  };

  const formatDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString("tr-TR");
  };

  const filterPermissions = (permission) => {
    if (filterOption === "" || filterOption === "Hepsi") {
      return true;
    } else {
      return permission.permissionType === filterOption;
    }
  };

  const isCancelEnabled = (approvalStatus) => {
    return approvalStatus === "Talep Edildi";
  };

  const confirmReject = (id) => {
    confirmAlert({
      title: "İzin İptali",
      message: "Bu izni iptal etmek istediğinizden emin misiniz?",
      buttons: [
        {
          label: "Evet",
          onClick: () => {
            handleReject(id);
            toast.success("İzin başarıyla iptal edildi.");
          },
        },
        {
          label: "Hayır",
          onClick: () => {},
        },
      ],
    });
  };

  const indexOfLastPermission = currentPage * permissionsPerPage;
  const indexOfFirstPermission = indexOfLastPermission - permissionsPerPage;
  const currentPermissions = sortedPermissions
    .filter(filterPermissions)
    .slice(indexOfFirstPermission, indexOfLastPermission);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <h1 className="text-center mb-4">İzin Talebi Listesi</h1>
          <div className="mb-3">
            <label htmlFor="filterOption">Filtrele :</label>
            <select
              id="filterOption"
              className="form-select"
              value={filterOption}
              onChange={(e) => {
                const selectedValue = e.target.value;
                setFilterOption(selectedValue);
              }}
            >
              <option value="">Hepsi</option>
              <option value="Baba İzni">Baba İzni</option>
              <option value="Anne İzni">Anne İzni</option>
              <option value="Cenaze İzni">Cenaze İzni</option>
              <option value="Evlilik İzni">Evlilik İzni</option>
              <option value="Yıllık İzin">Yıllık İzin</option>
            </select>
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-bordered table-hover">
              <thead className="bg-primary text-light">
                <tr>
                  <th
                    className="text-center"
                    onClick={() => sortBy("permissionType")}
                  >
                    İzin Türü{" "}
                    {sortDirection["permissionType"] === "asc" ? (
                      <FontAwesomeIcon icon={faSortUp} />
                    ) : (
                      <FontAwesomeIcon icon={faSortDown} />
                    )}
                  </th>
                  <th
                    className="text-center"
                    onClick={() => sortBy("requestDate")}
                  >
                    Talep Tarihi
                    {sortDirection["requestDate"] === "asc" ? (
                      <FontAwesomeIcon icon={faSortUp} />
                    ) : (
                      <FontAwesomeIcon icon={faSortDown} />
                    )}
                  </th>
                  <th
                    className="text-center"
                    onClick={() => sortBy("startDate")}
                  >
                    Başlangıç Tarihi{" "}
                    {sortDirection["startDate"] === "asc" ? (
                      <FontAwesomeIcon icon={faSortUp} />
                    ) : (
                      <FontAwesomeIcon icon={faSortDown} />
                    )}
                  </th>
                  <th className="text-center" onClick={() => sortBy("endDate")}>
                    Bitiş Tarihi{" "}
                    {sortDirection["endDate"] === "asc" ? (
                      <FontAwesomeIcon icon={faSortUp} />
                    ) : (
                      <FontAwesomeIcon icon={faSortDown} />
                    )}
                  </th>
                  <th
                    className="text-center"
                    onClick={() => sortBy("approvalStatus")}
                  >
                    Onay Durumu
                    {sortDirection["approvalStatus"] === "asc" ? (
                      <FontAwesomeIcon icon={faSortUp} />
                    ) : (
                      <FontAwesomeIcon icon={faSortDown} />
                    )}
                  </th>
                  <th className="text-center">Döküman</th>
                  <th className="text-center">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {currentPermissions.map((permission) => (
                  <tr key={permission.id}>
                    <td className="text-center">{permission.permissionType}</td>
                    <td className="text-center">
                      {formatDate(permission.requestDate)}
                    </td>
                    <td className="text-center">
                      {formatDate(permission.startDate)}
                    </td>
                    <td className="text-center">
                      {formatDate(permission.endDate)}
                    </td>
                    <td className="text-center">{permission.approvalStatus}</td>
                    <td className="text-center">
                      {permission.fileName && (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleDownload(permission.fileName)}
                        >
                          İndir
                        </button>
                      )}
                    </td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => confirmReject(permission.id)}
                        disabled={!isCancelEnabled(permission.approvalStatus)}
                      >
                        İptal Et
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="d-flex justify-content-center">
            <Pagination>
              <Pagination.Prev
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              />
              {[
                ...Array(
                  Math.ceil(
                    permissions.filter(filterPermissions).length /
                      permissionsPerPage
                  )
                ).keys(),
              ].map((number) => (
                <Pagination.Item
                  key={number + 1}
                  active={number + 1 === currentPage}
                  onClick={() => paginate(number + 1)}
                >
                  {number + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={
                  currentPage ===
                  Math.ceil(
                    permissions.filter(filterPermissions).length /
                      permissionsPerPage
                  )
                }
              />
            </Pagination>
          </div>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />
    </div>
  );
}

export default PermissionList;
