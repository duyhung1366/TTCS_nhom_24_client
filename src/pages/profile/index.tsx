import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  notification,
  Row,
  Select,
} from "antd";
import classNames from "classnames/bind";
import Footer from "../../components/footer";
import Header from "../../components/header";
import { AvatarIcon } from "../../components/icons/icons";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { RootState } from "../../redux/store";
import {
  FaRegUser,
  FaRegEnvelope,
  FaPhone,
  FaRegCalendarAlt,
  FaTransgender,
  FaRegAddressCard,
} from "react-icons/fa";
import styles from "./profile.module.scss";
import React, { useEffect, useReducer, useState } from "react";
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
import moment from "moment";
import dayjs from "dayjs";
import { apiChangePassword } from "../../api/user";

const cx = classNames.bind(styles);

const ProfilePages = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useAppDispatch();

  const [infoForm] = Form.useForm();
  const [modalForm] = Form.useForm();

  const userInfo = useAppSelector(
    (state: RootState) => state.authState.userInfo
  );

  useEffect(() => {
    infoForm.setFieldsValue({
      name: userInfo?.name,
      email: userInfo?.email,
      phoneNumber: userInfo?.phoneNumber,
      birth: dayjs(userInfo?.birth),
      classNumber: userInfo?.classNumber,
      gender: userInfo?.gender,
    });
  }, [infoForm]);

  const handleShowModal = () => {
    setIsModalOpen(true);
  };

  const handleChangePassword = () => {
    modalForm.validateFields().then(async (value) => {
      const cookie = Cookies.get("token");
      const { password, newPassword, ...rest } = value;

      const passEncode = encrypt(password);
      const newPassEncode = encrypt(newPassword);

      try {
        // const actionResult = await dispatch(
        //   requestChangePassword({
        //     token: cookie,
        //     password: passEncode,
        //     newPassword: newPassEncode,
        //   })
        // );
        // const res = unwrapResult(actionResult);
        const res: any = await apiChangePassword({
          token: cookie,
          password: passEncode,
          newPassword: newPassEncode,
        });

        switch (res.data.loginCode) {
          case TTCSconfig.LOGIN_SUCCESS:
            handleCancelModal();
            return notification.success({
              message: "?????i m???t kh???u th??nh c??ng",
              duration: 1.5,
            });

          case TTCSconfig.LOGIN_WRONG_PASSWORD:
            modalForm.setFieldsValue({
              password: "",
              newPassword: "",
              confirmNewPassword: "",
            });
            return notification.warning({
              message: "M???t kh???u hi???n t???i kh??ng ch??nh x??c!",
              duration: 1.5,
            });

          case TTCSconfig.LOGIN_FAILED:
            return notification.warning({
              message: "L???i server!",
              duration: 1.5,
            });

          case TTCSconfig.LOGIN_TOKEN_INVALID:
            notification.warning({
              message: "Kh??ng th??? t??m th???y token!",
              duration: 1.5,
            });
            window.location.href = "/login";
            break;
        }
      } catch (error) {
        return notification.warning({
          message: "C???p nh???t th???t b???i, l???i server!",
          duration: 1.5,
        });
      }
    });
  };

  const handleUpdate = async () => {
    infoForm.validateFields().then(async (value) => {
      const cookie = Cookies.get("token");
      value.birth = value.birth?.valueOf();

      try {
        const actionResult = await dispatch(
          requestUpdateUserInfo({ token: cookie, userInfo: value })
        );
        const res = unwrapResult(actionResult);
        switch (res.status) {
          case TTCSconfig.STATUS_SUCCESS:
            return notification.success({
              message: "C???p nh???t th??nh c??ng!",
              duration: 1.5,
            });

          case TTCSconfig.STATUS_FAIL:
            return notification.warning({
              message: "C???p nh???t th???t b???i!",
              duration: 1.5,
            });
        }
      } catch (error) {
        return notification.warning({
          message: "C???p nh???t th???t b???i, l???i server!",
          duration: 1.5,
        });
      }
    });
  };

  const handleCancelModal = () => {
    modalForm.setFieldsValue({
      password: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setIsModalOpen(false);
  };

  return (
    <>
      <div className={cx("profile")}>
        <Header />

        <div className={cx("profile__container")}>
          <div className={cx("wide")}>
            <div className={cx("profile__wrapper")}>
              <div className={cx("profile__title")}>Th??ng tin c?? nh??n</div>
              <div className={cx("profile__box")}>
                <Form
                  name="profile"
                  className={cx("profile__form")}
                  form={infoForm}
                >
                  <Row>
                    <Col xl={8} lg={8} md={8} sm={24} xs={24}>
                      <div className={cx("profile__avatar")}>
                        <AvatarIcon className={cx("profile__icon")} />
                      </div>
                      <div className={cx("profile__username")}>
                        {userInfo?.account}
                      </div>
                    </Col>

                    <Col xl={16} lg={16} md={16} sm={24} xs={24}>
                      <Row gutter={16}>
                        <Col xl={12} lg={12} md={12} sm={24} xs={24}>
                          <Form.Item
                            className={cx("profile__formitem")}
                            name="name"
                            rules={[
                              {
                                required: true,
                                message: "Vui l??ng nh???p tr?????ng n??y!",
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
                              placeholder="Nh???p t??n"
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
                                message: "Email kh??ng ????ng ?????nh d???ng!",
                              },
                              {
                                required: true,
                                message: "Vui l??ng nh???p tr?????ng n??y!",
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
                              placeholder="Nh???p email"
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
                                message: "vui l??ng nh???p s??? ??i???n tho???i",
                              },
                              {
                                required: true,
                                message: "Vui l??ng nh???p tr?????ng n??y!",
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
                              placeholder="Nh???p s??? ??i???n tho???i"
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
                              placeholder="Ch???n ng??y sinh"
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
                                  &nbsp; Ch???n l???p
                                </React.Fragment>
                              }
                              size={"large"}
                              listHeight={128}
                              value={userInfo?.classNumber}
                            >
                              {classes.map((data) => (
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
                                  &nbsp; Ch???n gi???i t??nh
                                </React.Fragment>
                              }
                              size={"large"}
                              listHeight={128}
                              value={userInfo?.gender}
                            >
                              {genders.map((data) => (
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
                            onClick={handleShowModal}
                          >
                            ?????i m???t kh???u
                          </button>

                          <Modal
                            className={cx("profile__modal")}
                            open={isModalOpen}
                            // onOk={handleOkModal}
                            onCancel={handleCancelModal}
                            footer={[
                              <Button
                                key="changePassword"
                                className={cx("profile__button", "btn-modal")}
                                onClick={handleChangePassword}
                              >
                                X??c nh???n
                              </Button>,
                            ]}
                          >
                            <h2 className={cx("profile__modal--title")}>
                              ?????i m???t kh???u
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
                                  placeholder="M???t kh???u hi???n t???i"
                                  style={{ padding: "1.6rem" }}
                                />
                              </Form.Item>
                              <Form.Item
                                name="newPassword"
                                className={cx("profile__formitem")}
                                dependencies={["password"]}
                                rules={[
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
                                          "M???t kh???u m???i ph???i kh??c m???t kh???u hi???n t???i!"
                                        )
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
                                  placeholder="M???t kh???u m???i"
                                  style={{ padding: "1.6rem" }}
                                />
                              </Form.Item>
                              <Form.Item
                                name="confirmNewPassword"
                                className={cx("profile__formitem")}
                                dependencies={["newPassword"]}
                                rules={[
                                  ({ getFieldValue }) => ({
                                    validator(_, value) {
                                      if (
                                        !value ||
                                        getFieldValue("newPassword") === value
                                      ) {
                                        return Promise.resolve();
                                      }
                                      return Promise.reject(
                                        new Error("M???t kh???u kh??ng tr??ng kh???p!")
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
                                  placeholder="X??c nh???n m???t kh???u"
                                  style={{ padding: "1.6rem" }}
                                />
                              </Form.Item>
                            </Form>
                          </Modal>

                          <button
                            className={cx("btn-update", "profile__button")}
                            onClick={handleUpdate}
                          >
                            C???p nh???t
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
