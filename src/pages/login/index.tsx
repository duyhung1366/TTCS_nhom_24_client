import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, notification } from "antd";
import { useEffect, useState } from "react";
import { unwrapResult } from "@reduxjs/toolkit";
import classNames from "classnames/bind";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  requestLogin,
  requestLoginWithGoogle,
} from "../../redux/slices/userSlice";
import { RootState } from "../../redux/store";
import TTCSconfig from "../../submodule/common/config";
import { encrypt } from "../../submodule/utils/crypto";
import styles from "./login.module.scss";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";
import axios from "axios";

const cx = classNames.bind(styles);

const LoginPages = () => {
  const userInfo = useAppSelector(
    (state: RootState) => state.authState.userInfo
  );
  const loading = useAppSelector((state: RootState) => state.authState.loading);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // lay token tu cookie

  useEffect(() => {
    if (userInfo?._id) {
      navigate(-1);
    }
  }, [userInfo]);

  const [user, setUser] = useState<any>();

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => console.log("Login Failed:", error),
  });

  useEffect(() => {
    if (user) {
      axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
              Accept: "application/json",
            },
          }
        )
        .then((res) => {
          handleLoginWithGoogle(res.data);
        })
        .catch((err) => console.log(err));
    }
  }, [user]);

  const handleLoginWithGoogle = async (data: any) => {
    try {
      const actionResult = await dispatch(
        requestLoginWithGoogle({
          name: data.name,
          account: data.email,
          googleId: data.id,
          avatar: data.picture,
          email: data.email,
        })
      );

      const res = unwrapResult(actionResult);
      switch (res.loginCode) {
        case TTCSconfig.LOGIN_FAILED:
          return notification.error({
            message: "Đăng ký thất bại",
            duration: 1.5,
          });

        case TTCSconfig.LOGIN_SUCCESS:
          Cookies.set("token", res.token, {
            expires: 60 * 60 * 24 * 30,
          });
          return notification.success({
            message: "Đăng nhập thành công",
            duration: 1.5,
          });
      }
    } catch (err) {
      notification.error({
        message: "Đăng ký thất bại, lỗi server",
        duration: 1.5,
      });
    }
  };

  // log out function to log the user out of google and set the profile array to null
  const logOut = () => {
    googleLogout();
    setUser(null);
  };

  const handleLogin: any = async (data: {
    account: string;
    password: string;
  }) => {
    try {
      const encodePassword = encrypt(data.password);
      const actionResult = await dispatch(
        requestLogin({
          account: data.account,
          password: encodePassword,
        })
      );

      const res = unwrapResult(actionResult);
      switch (res.loginCode) {
        case TTCSconfig.LOGIN_FAILED:
          return notification.error({
            message: "Đăng nhập thất bại",
            duration: 1.5,
          });

        case TTCSconfig.LOGIN_ACCOUNT_NOT_EXIST:
          return notification.warning({
            message: "Tài khoản hoặc mật khẩu không đúng",
            duration: 1.5,
          });

        case TTCSconfig.LOGIN_WRONG_PASSWORD:
          return notification.warning({
            message: "Tài khoản hoặc mật khẩu không đúng",
            duration: 1.5,
          });

        case TTCSconfig.LOGIN_SUCCESS:
          Cookies.set("token", res.token, {
            expires: 60 * 60 * 24 * 30,
          });
          return notification.success({
            message: "Đăng nhập thành công",
            duration: 1.5,
          });
      }
    } catch (err) {
      return notification.error({
        message: "Đăng nhập thất bại, lỗi server",
        duration: 1.5,
      });
    }
  };

  return (
    <>
      <div className={cx("login__over")}>
        <div className={cx("login__wrapper")}>
          <h2 className={cx("login__title")}>Đăng Nhập</h2>
          <Form
            name="normal_login"
            className={cx("login__form")}
            initialValues={{
              remember: true,
            }}
            onFinish={handleLogin}
          >
            <Form.Item
              name="account"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập trường này!",
                },
              ]}
            >
              <Input
                prefix={
                  <UserOutlined
                    className={cx("site-form-item-icon input__icon")}
                    style={{ fontSize: "1.8rem", marginRight: "0.8rem" }}
                  />
                }
                placeholder="Nhập tài khoản"
                style={{ padding: "12px" }}
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập trường này!",
                },
              ]}
            >
              <Input.Password
                prefix={
                  <LockOutlined
                    className={cx("site-form-item-icon input__icon")}
                    style={{ fontSize: "1.8rem", marginRight: "0.8rem" }}
                  />
                }
                type="password"
                placeholder="Nhập mật khẩu"
                style={{ padding: "12px" }}
              />
            </Form.Item>

            <Form.Item>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Duy trì đăng nhập</Checkbox>
              </Form.Item>

              <a className={cx("login-form-forgot")} href="/">
                Quên mật khẩu
              </a>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className={cx("login-form-button")}
                loading={loading}
              >
                Đăng nhập
              </Button>

              <div className={cx("login__toregister")}>
                Bạn chưa có tài khoản?{" "}
                <Link to="/dang-ky" className={cx("login__toregisterlink")}>
                  Đăng ký ngay!
                </Link>
              </div>

              <div className={cx("login__or")}>
                <span className={cx("login__ortext")}>HOẶC</span>
              </div>

              <button
                className={cx("btn_login-google")}
                onClick={(e) => {
                  e.preventDefault();
                  login();
                }}
              >
                <FcGoogle />
                <p>Sign in with Google</p>
              </button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </>
  );
};

export default LoginPages;
