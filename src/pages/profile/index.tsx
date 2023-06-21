import {
  Avatar,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  notification,
  Row,
  Select,
  Spin,
  Upload,
} from "antd";
import classNames from "classnames/bind";
import Footer from "../../components/footer";
import Header from "../../components/header";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { RootState } from "../../redux/store";
import {
  FaRegUser,
  FaRegEnvelope,
  FaPhone,
  FaRegCalendarAlt,
  FaTransgender,
  FaRegAddressCard,
  FaCamera,
} from "react-icons/fa";
import styles from "./profile.module.scss";
import React, { useEffect, useState } from "react";
import { EmailRegExp, PhoneRegExp } from "../../submodule/utils/validation";
import { classes, genders } from "../../utils/contants";
import { LockOutlined } from "@ant-design/icons";
import Cookies from "js-cookie";
import { unwrapResult } from "@reduxjs/toolkit";
import {
  requestChangePassword,
  requestUpdateUserInfo,
} from "../../redux/slices/userSlice";
import TTCSconfig from "../../submodule/common/config";
import { encrypt } from "../../submodule/utils/crypto";
import dayjs from "dayjs";
import fallbackAvatar from "./../../assets/img/fallback-avt.jpg";
import { apiUploadFile } from "../../api/upload";

const cx = classNames.bind(styles);

const ProfilePages = () => {
  const [isModalChangePassword, setIsModalChangePassword] = useState(false);
  const dispatch = useAppDispatch();
  const [infoForm] = Form.useForm();
  const [modalForm] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState<string>();
  const [isLoad, setIsLoad] = useState<boolean>(true);

  const userInfo = useAppSelector(
    (state: RootState) => state.authState.userInfo
  );

  useEffect(() => {
    infoForm.setFieldsValue({
      name: userInfo?.name,
      email: userInfo?.email,
      phoneNumber: userInfo?.phoneNumber,
      birth: userInfo?.birth ? dayjs(userInfo?.birth) : null,
      classNumber: userInfo?.classNumber,
      gender: userInfo?.gender,
    });
  }, [infoForm]);

  const handleShowModal = () => {
    setIsModalChangePassword(true);
  };

  const handleChangePassword = () => {
    modalForm.validateFields().then(async (value) => {
      const cookie = Cookies.get("token");
      const { password, newPassword, ...rest } = value;

      const passEncode = encrypt(password);
      const newPassEncode = encrypt(newPassword);

      try {
        const actionResult = await dispatch(
          requestChangePassword({
            token: cookie,
            password: passEncode,
            newPassword: newPassEncode,
          })
        );
        const res = unwrapResult(actionResult);

        switch (res.loginCode) {
          case TTCSconfig.LOGIN_SUCCESS:
            handleCancelModal();
            return notification.success({
              message: "Đổi mật khẩu thành công",
              duration: 1.5,
            });

          case TTCSconfig.LOGIN_WRONG_PASSWORD:
            modalForm.setFieldsValue({
              password: "",
              newPassword: "",
              confirmNewPassword: "",
            });
            return notification.warning({
              message: "Mật khẩu hiện tại không chính xác!",
              duration: 1.5,
            });

          case TTCSconfig.LOGIN_FAILED:
            return notification.warning({
              message: "Lỗi server!",
              duration: 1.5,
            });

          case TTCSconfig.LOGIN_TOKEN_INVALID:
            notification.warning({
              message: "Không thể tìm thấy token!",
              duration: 1.5,
            });
            window.location.href = "/dang-nhap";
            break;
        }
      } catch (error) {
        return notification.warning({
          message: "Cập nhật thất bại, lỗi server!",
          duration: 1.5,
        });
      }
    });
  };

  const handleUpdate = async () => {
    infoForm.validateFields().then(async (value) => {
      const cookie = Cookies.get("token");
      value.birth = value.birth?.valueOf();
      value.avatar = avatarUrl;

      try {
        const actionResult = await dispatch(
          requestUpdateUserInfo({ token: cookie, userInfo: value })
        );
        const res = unwrapResult(actionResult);
        switch (res.status) {
          case TTCSconfig.STATUS_SUCCESS:
            return notification.success({
              message: "Cập nhật thành công!",
              duration: 1.5,
            });

          case TTCSconfig.STATUS_FAIL:
            return notification.warning({
              message: "Cập nhật thất bại!",
              duration: 1.5,
            });
        }
      } catch (error) {
        return notification.warning({
          message: "Cập nhật thất bại, lỗi server!",
          duration: 1.5,
        });
      }
    });
  };

  // const handleUpdateAvatar = async () => {
  //   const cookie = Cookies.get("token");

  //   try {
  //     const actionResult = await dispatch(
  //       requestUpdateUserInfo({
  //         token: cookie,
  //         userInfo: { avatar: dataUpload },
  //       })
  //     );
  //     const res = unwrapResult(actionResult);
  //     switch (res.status) {
  //       case TTCSconfig.STATUS_SUCCESS:
  //         return notification.success({
  //           message: "Cập nhật thành công!",
  //           duration: 1.5,
  //         });

  //       case TTCSconfig.STATUS_FAIL:
  //         return notification.warning({
  //           message: "Cập nhật thất bại!",
  //           duration: 1.5,
  //         });
  //     }
  //   } catch (error) {
  //     return notification.warning({
  //       message: "Cập nhật thất bại, lỗi server!",
  //       duration: 1.5,
  //     });
  //   }
  // };

  const handleCancelModal = () => {
    modalForm.setFieldsValue({
      password: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setIsModalChangePassword(false);
  };

  return (
    <>
      <div className={cx("profile")}>
        <Header />

        <div className={cx("profile__container")}>
          <div className={cx("wide")}>
            <div className={cx("profile__wrapper")}>
              <div className={cx("profile__title")}>Thông tin cá nhân</div>
              <div className={cx("profile__box")}>
                <Form
                  name="profile"
                  className={cx("profile__form")}
                  form={infoForm}
                >
                  <Row>
                    <Col xl={8} lg={8} md={8} sm={24} xs={24}>
                      <div className={cx("profile__avatar")}>
                        {userInfo?.avatar ? (
                          <Upload
                            className={cx("profile__avatar--upload")}
                            customRequest={async (options) => {
                              const { file } = options;
                              try {
                                setIsLoad(false);
                                const res = await apiUploadFile(file);
                                setAvatarUrl(res.data);
                                setIsLoad(true);
                              } catch (error: any) {
                                notification.error({
                                  message: "Lỗi server",
                                  duration: 1.5,
                                });
                              }
                            }}
                            name="avatar"
                            maxCount={1}
                            accept="image/*"
                            showUploadList={false}
                          >
                            {isLoad ? (
                              <img
                                className={cx("profile__img")}
                                src={avatarUrl ? avatarUrl : userInfo?.avatar}
                              />
                            ) : (
                              <div className={cx("profile__img--loading")}>
                                <Spin />
                              </div>
                            )}
                          </Upload>
                        ) : (
                          <Upload
                            className={cx("profile__avatar--upload")}
                            customRequest={async (options) => {
                              const { file } = options;
                              try {
                                const res = await apiUploadFile(file);
                                setAvatarUrl(res.data);
                              } catch (error: any) {
                                notification.error({
                                  message: "Lỗi server",
                                  duration: 1.5,
                                });
                              }
                            }}
                            name="avatar"
                            maxCount={1}
                            accept="image/*"
                            showUploadList={false}
                          >
                            {isLoad ? (
                              <img
                                className={cx(
                                  "profile__img",
                                  "profile__img--fallback"
                                )}
                                src={avatarUrl ? avatarUrl : fallbackAvatar}
                              />
                            ) : (
                              <div className={cx("profile__img--loading")}>
                                <Spin />
                              </div>
                            )}
                          </Upload>
                        )}
                        <FaCamera className={cx("profile__upload--icon")} />
                      </div>
                      <div className={cx("profile__username")}>
                        {userInfo?.account}
                      </div>
                    </Col>

                    {/* <Modal
                      title="Upload Avatar"
                      open={isModalChangeAvatar}
                      onCancel={() => {
                        setIsModalChangeAvatar(false);
                      }}
                      onOk={() => {
                        dataUpload && handleUpdateAvatar();
                        setIsModalChangeAvatar(false);
                      }}
                    >
                      <UploadImg
                        defaultUrl={userInfo?.avatar}
                        onChangeUrl={(value) => setDataUpload(value)}
                      />
                    </Modal> */}

                    <Col xl={16} lg={16} md={16} sm={24} xs={24}>
                      <Row gutter={16}>
                        <Col xl={12} lg={12} md={12} sm={24} xs={24}>
                          <Form.Item
                            className={cx("profile__formitem")}
                            name="name"
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng nhập trường này!",
                              },
                            ]}
                          >
                            <Input
                              prefix={
                                <FaRegUser
                                  style={{
                                    fontSize: "1.8rem",
                                    marginRight: "0.8rem",
                                  }}
                                />
                              }
                              placeholder="Nhập tên"
                              style={{ padding: "16px" }}
                              value={userInfo?.name}
                            />
                          </Form.Item>
                        </Col>

                        <Col xl={12} lg={12} md={12} sm={24} xs={24}>
                          <Form.Item
                            className={cx("profile__formitem")}
                            name="email"
                            rules={[
                              {
                                pattern: EmailRegExp,
                                message: "Email không đúng định dạng!",
                              },
                              {
                                required: true,
                                message: "Vui lòng nhập trường này!",
                              },
                            ]}
                          >
                            <Input
                              prefix={
                                <FaRegEnvelope
                                  style={{
                                    fontSize: "1.8rem",
                                    marginRight: "0.8rem",
                                  }}
                                />
                              }
                              placeholder="Nhập email"
                              style={{ padding: "16px" }}
                              value={userInfo?.email}
                            />
                          </Form.Item>
                        </Col>

                        <Col xl={12} lg={12} md={12} sm={24} xs={24}>
                          <Form.Item
                            className={cx("profile__formitem")}
                            name="phoneNumber"
                            rules={[
                              {
                                pattern: PhoneRegExp,
                                message: "vui lòng nhập số điện thoại",
                              },
                              {
                                required: true,
                                message: "Vui lòng nhập trường này!",
                              },
                            ]}
                          >
                            <Input
                              prefix={
                                <FaPhone
                                  style={{
                                    fontSize: "1.8rem",
                                    marginRight: "0.8rem",
                                  }}
                                />
                              }
                              placeholder="Nhập số điện thoại"
                              style={{ padding: "16px" }}
                              value={userInfo?.phoneNumber}
                            />
                          </Form.Item>
                        </Col>

                        <Col xl={12} lg={12} md={12} sm={24} xs={24}>
                          <Form.Item
                            className={cx("profile__formitem")}
                            name="birth"
                          >
                            <DatePicker
                              suffixIcon={<FaRegCalendarAlt />}
                              placeholder="Chọn ngày sinh"
                              format={"DD/MM/YYYY"}
                              allowClear={false}
                              showToday={false}
                              className={cx("profile__datepicker")}
                            />
                          </Form.Item>
                        </Col>

                        <Col xl={12} lg={12} md={12} sm={24} xs={24}>
                          <Form.Item
                            className={cx("profile__formitem")}
                            name="classNumber"
                          >
                            <Select
                              className={cx("profile__select")}
                              optionLabelProp="label"
                              placeholder={
                                <React.Fragment>
                                  <FaRegAddressCard
                                    style={{
                                      fontSize: "1.8rem",
                                      marginRight: "0.8rem",
                                      marginTop: "0.8rem",
                                      color: "#000",
                                    }}
                                  />
                                  &nbsp; Chọn lớp
                                </React.Fragment>
                              }
                              size={"large"}
                              listHeight={128}
                              value={userInfo?.classNumber}
                            >
                              {classes?.map((data) => (
                                <Select.Option
                                  value={data.value}
                                  key={data.value}
                                  label={
                                    <React.Fragment>
                                      <FaRegAddressCard
                                        style={{
                                          fontSize: "1.8rem",
                                          marginRight: "0.8rem",
                                          marginTop: "0.8rem",
                                        }}
                                      />
                                      &nbsp;
                                      {data.label}
                                    </React.Fragment>
                                  }
                                >
                                  {data.label}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col xl={12} lg={12} md={12} sm={24} xs={24}>
                          <Form.Item
                            className={cx("profile__formitem")}
                            name="gender"
                          >
                            <Select
                              className={cx("profile__select")}
                              optionLabelProp="label"
                              placeholder={
                                <React.Fragment>
                                  <FaTransgender
                                    style={{
                                      fontSize: "1.8rem",
                                      marginRight: "0.8rem",
                                      marginTop: "0.8rem",
                                      color: "#000",
                                    }}
                                  />
                                  &nbsp; Chọn giới tính
                                </React.Fragment>
                              }
                              size={"large"}
                              listHeight={128}
                              value={userInfo?.gender}
                            >
                              {genders?.map((data) => (
                                <Select.Option
                                  value={data.value}
                                  key={data.value}
                                  label={
                                    <React.Fragment>
                                      <FaTransgender
                                        style={{
                                          fontSize: "1.8rem",
                                          marginRight: "0.8rem",
                                          marginTop: "0.8rem",
                                        }}
                                      />
                                      &nbsp;
                                      {data.label}
                                    </React.Fragment>
                                  }
                                >
                                  {data.label}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>

                        <Col
                          xl={24}
                          lg={24}
                          md={24}
                          sm={24}
                          xs={24}
                          className={cx("profile__group--btn")}
                        >
                          <button
                            className={cx("btn-change", "profile__button")}
                            onClick={(e) => {
                              e.preventDefault();
                              handleShowModal();
                            }}
                          >
                            Đổi mật khẩu
                          </button>

                          <Modal
                            className={cx("profile__modal")}
                            open={isModalChangePassword}
                            onCancel={handleCancelModal}
                            footer={[
                              <Button
                                key="changePassword"
                                className={cx("profile__button", "btn-modal")}
                                onClick={handleChangePassword}
                              >
                                Xác nhận
                              </Button>,
                            ]}
                          >
                            <h2 className={cx("profile__modal--title")}>
                              Đổi mật khẩu
                            </h2>
                            <Form
                              className={cx("profile__modal--form")}
                              form={modalForm}
                              name="modal"
                            >
                              <Form.Item
                                name="password"
                                className={cx("profile__formitem")}
                              >
                                <Input
                                  prefix={
                                    <LockOutlined
                                      style={{
                                        fontSize: "1.8rem",
                                        marginRight: "0.8rem",
                                      }}
                                    />
                                  }
                                  type="password"
                                  placeholder="Mật khẩu hiện tại"
                                  style={{ padding: "1.6rem" }}
                                />
                              </Form.Item>
                              <Form.Item
                                name="newPassword"
                                className={cx("profile__formitem")}
                                dependencies={["password"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng nhập trường này!",
                                  },
                                  ({ getFieldValue }) => ({
                                    validator(_, value) {
                                      if (
                                        !value ||
                                        getFieldValue("password") !== value
                                      ) {
                                        return Promise.resolve();
                                      }
                                      return Promise.reject(
                                        new Error(
                                          "Mật khẩu mới phải khác mật khẩu hiện tại!"
                                        )
                                      );
                                    },
                                  }),
                                  {
                                    min: 8,
                                    pattern:
                                      /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$*])/,
                                    message:
                                      "Mật khẩu phải có ít nhất 8 ký tự, phải chứa nhất một ký tự đặc biệt, một chữ hoa, một chữ thường và một số",
                                  },
                                ]}
                              >
                                <Input
                                  prefix={
                                    <LockOutlined
                                      style={{
                                        fontSize: "1.8rem",
                                        marginRight: "0.8rem",
                                      }}
                                    />
                                  }
                                  type="password"
                                  placeholder="Mật khẩu mới"
                                  style={{ padding: "1.6rem" }}
                                />
                              </Form.Item>
                              <Form.Item
                                name="confirmNewPassword"
                                className={cx("profile__formitem")}
                                dependencies={["newPassword"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "Vui lòng nhập trường này!",
                                  },
                                  ({ getFieldValue }) => ({
                                    validator(_, value) {
                                      if (
                                        !value ||
                                        getFieldValue("newPassword") === value
                                      ) {
                                        return Promise.resolve();
                                      }
                                      return Promise.reject(
                                        new Error("Mật khẩu không trùng khớp!")
                                      );
                                    },
                                  }),
                                ]}
                              >
                                <Input
                                  prefix={
                                    <LockOutlined
                                      style={{
                                        fontSize: "1.8rem",
                                        marginRight: "0.8rem",
                                      }}
                                    />
                                  }
                                  type="password"
                                  placeholder="Xác nhận mật khẩu"
                                  style={{ padding: "1.6rem" }}
                                />
                              </Form.Item>
                            </Form>
                          </Modal>

                          <button
                            className={cx("btn-update", "profile__button")}
                            onClick={handleUpdate}
                          >
                            Cập nhật
                          </button>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Form>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default ProfilePages;
