import React, { useState, useEffect } from "react";
import { Row, Col, Card, Form, Button, Image, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { HiOutlineCheckCircle } from "react-icons/hi"; // React Icons'tan onay işareti ikonu
import AuthLayout from "../../layouts/AuthLayout";
import { changePassword } from "../api/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../components/TokenContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  // const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [error, setError] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(false); // Durum değişkeni ekleyin
  const navigateTo = useNavigate();
  const queryParams = new URLSearchParams(window.location.search);
  const email = queryParams.get("email");
  const { token, setAuthToken } = useAuth();

  const isValidPassword = (value) => {
    // Şifrenin en az 6 karakter uzunluğunda olup olmadığını kontrol et
    if (value.length < 6) {
      return false;
    }

    // Şifrenin en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içerip içermediğini kontrol et
    const containsUpperCase = /[A-Z]/.test(value);
    const containsLowerCase = /[a-z]/.test(value);
    const containsNumber = /\d/.test(value);
    const containsSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(
      value
    );

    return (
      containsUpperCase &&
      containsLowerCase &&
      containsNumber &&
      containsSpecialChar
    );
  };

  const passwordsMatchCheck = () => {
    if (password === repeatPassword && password && repeatPassword) {
      setPasswordsMatch(true);
    } else {
      setPasswordsMatch(false);
    }
  };

  // Şifrelerin herhangi biri değiştiğinde eşleşmeyi kontrol et
  useEffect(() => {
    passwordsMatchCheck();
  }, [password, repeatPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !repeatPassword) {
      toast.warning("Lütasdasdldurun.");
      return;
    }

    if (password !== repeatPassword) {
      toast.error("Şifreler eşleşmiyor.");
      return;
    }

    if (!isValidPassword(password)) {
      toast.warning(
        "Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermeli ve en az 6 karakter uzunluğunda olmalıdır."
      );
      return;
    }

    // Şifre yenileme işlemleri

    try {
      const response = await changePassword(email, password, repeatPassword);
      if (response.status === 200) {
        toast.success("Sifre basarili bir sekilde degistirildi !");
        // Başarılı bir şekilde şifre değiştirildiğinde yapılacak işlemler buraya
        setAuthToken(null);
        setTimeout(() => {
          navigateTo("/"); // Örneğin anasayfaya yönlendirme
        }, 2000);
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      toast.warning("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <Row
        className="align-items-center justify-content-center g-0 min-vh-100"
        style={{
          backgroundImage: `url('/Images/background/login-background6.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Col xxl={4} lg={6} md={8} xs={12} className="py-8 py-xl-0">
          <Card className="smooth-shadow-md">
            <Card.Body className="p-6">
              <div className="mb-4">
                <Link to="/">
                  <Image
                    src="/Images/brand/logo/logo-habss-hd.png"
                    className="mb-2"
                    alt=""
                  />
                </Link>
                <p className="mb-6">
                  Şifrenizi yenilemek için aşağıdaki bilgileri doldurun.
                </p>
              </div>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="text"
                    name="email"
                    readOnly
                    placeholder="Email adresinizi giriniz"
                    value={email}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Şifre</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Yeni şifrenizi giriniz"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      variant="light"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? "Gizle" : "Göster"}
                    </Button>
                  </div>
                </Form.Group>
                <Form.Group className="mb-3" controlId="repeatPassword">
                  <Form.Label>Şifre Tekrarı</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type={showRepeatPassword ? "text" : "password"}
                      name="repeatPassword"
                      placeholder="Yeni şifrenizi tekrar giriniz"
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                    />
                    <Button
                      variant="light"
                      onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    >
                      {showRepeatPassword ? "Gizle" : "Göster"}
                    </Button>
                  </div>
                </Form.Group>

                {error && <Alert variant="danger">{error}</Alert>}
                <div>
                  <div className="d-grid">
                    <Button variant="primary" type="submit">
                      Şifreyi Yenile
                    </Button>
                  </div>
                </div>
              </Form>
              {/* Şifreler eşleştiğinde onay işareti göstermek */}
              {passwordsMatch && (
                <HiOutlineCheckCircle className="text-success position-absolute top-50 end-0 translate-middle-y me-3" />
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

ResetPassword.Layout = AuthLayout;

export default ResetPassword;
