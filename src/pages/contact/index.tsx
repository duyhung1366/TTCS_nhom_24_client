import { Button, Col, Form, Input, Row } from "antd";
import classNames from "classnames/bind";

import Footer from "../../components/footer";
import Header from "../../components/header";
import styles from "./contact.module.scss";

const cx = classNames.bind(styles);

const ContactPages = () => {
  const onFinish = (values: any) => {
    // console.log(values);
  };

  return (
    <>
      <div className={cx("contact")}>
        <Header />
        <div className="wide">
          <div className={cx("contact__container")}>
            <div className={cx("contact__wrapper")}>
              <Row
                style={{ width: "100%" }}
                gutter={{ xl: 16, lg: 16, md: 0, sm: 0, xs: 0 }}
                className={cx("contact__row")}
              >
                <Col
                  className={cx("contact__col")}
                  xs={24}
                  sm={24}
                  md={12}
                  lg={12}
                >
                  <h1 className={cx("contact__title")}>
                    Liên hệ với chúng tôi
                  </h1>
                  <Form
                    name="nest-messages"
                    layout="vertical"
                    onFinish={onFinish}
                    size={"large"}
                    className={cx("contact__form")}
                  >
                    <Form.Item
                      className={cx("contact__form--label")}
                      name={["user", "name"]}
                      label="Họ và tên (*)"
                    >
                      <Input
                        className={cx("contact__form--input")}
                        placeholder="Họ và tên"
                      />
                    </Form.Item>
                    <Form.Item
                      className={cx("contact__form--label")}
                      name={["user", "email"]}
                      label="Email (*)"
                    >
                      <Input
                        className={cx("contact__form--input")}
                        placeholder="Email"
                      />
                    </Form.Item>
                    <Form.Item
                      className={cx("contact__form--label")}
                      name={["user", "number"]}
                      label="Số điện thoại (*)"
                    >
                      <Input
                        className={cx("contact__form--input")}
                        placeholder="Số điện thoại"
                      />
                    </Form.Item>
                    <Form.Item
                      className={cx("contact__form--label")}
                      name={["user", "title"]}
                      label="Tiêu đề (*)"
                    >
                      <Input
                        className={cx("contact__form--input")}
                        placeholder="Tiêu đề"
                      />
                    </Form.Item>
                    <Form.Item
                      className={cx("contact__form--label")}
                      name={["user", "content"]}
                      label="Nội dung (*)"
                    >
                      <Input.TextArea
                        className={cx("contact__form--input")}
                        placeholder="Vui lòng mô tả chi tiết"
                        rows={4}
                        style={{ resize: "none" }}
                      />
                    </Form.Item>
                    <Form.Item className={cx("contact__form--label")}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        className={cx("contact__form-btn")}
                      >
                        Gửi liên hệ
                      </Button>
                    </Form.Item>
                  </Form>
                </Col>

                <Col
                  className={cx("contact__col")}
                  xs={24}
                  sm={24}
                  md={12}
                  lg={12}
                >
                  <h1 className={cx("contact__title")}>
                    Thông tin liên hệ khác
                  </h1>
                  <div className={cx("contact__list")}>
                    <div className={cx("contact__item")}>
                      <p>
                        learn4ever là website luyện tập trắc nghiệm online cho
                        các bạn học sinh các cấp. Nếu các em có bất cứ thắc mắc
                        hay câu hỏi nào đừng ngần ngại liên hệ với learn4ever
                        nhé.
                      </p>
                    </div>
                    <div className={cx("contact__item")}>
                      <span>Email: </span>{" "}
                      <a href="mailto:nhom24_ttcs@gmail.com">
                        nhom24_ttcs@gmail.com
                      </a>
                    </div>
                    <div className={cx("contact__item")}>
                      <span>Hotline: </span>{" "}
                      <a href="tel:0123456789">0123456789</a>
                    </div>
                    <div className={cx("contact__item")}>
                      <div>Nhom24_TTCS Học viện kỹ thuật Mật Mã</div>
                      <p style={{ margin: "1.6rem 0" }}>
                        <span>Địa chỉ: </span>
                        141 Đường Chiến Thắng, Xã Tân Triều, Huyện Thanh Trì, Hà
                        Nội
                      </p>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default ContactPages;
