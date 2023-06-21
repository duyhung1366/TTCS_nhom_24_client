import { unwrapResult } from "@reduxjs/toolkit";
import { Breadcrumb, Col, notification, Row } from "antd";
import classNames from "classnames/bind";
import moment from "moment";
import { useEffect, useState } from "react";
import {
  FaBatteryFull,
  FaClock,
  FaFilm,
  FaLightbulb,
  FaPencilRuler,
} from "react-icons/fa";
import { NavLink, useParams } from "react-router-dom";
import { apiLoadTopicByCourse } from "../../api/topic";
import Footer from "../../components/footer";
import Header from "../../components/header";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import { categoryState } from "../../redux/slices/categorySlice";
import {
  courseState,
  requestLoadCourseBySlug,
} from "../../redux/slices/courseSlice";
import {
  requestLoadTopicByCourse,
  topicState,
} from "../../redux/slices/topicSlice";
import TTCSconfig from "../../submodule/common/config";
import styles from "./courseDetail.module.scss";

const cx = classNames.bind(styles);

const CourseDetail = () => {
  const params = useParams();
  const dispatch = useAppDispatch();
  const courseReducer = useAppSelector(courseState);
  const course = courseReducer.course;
  const loading = courseReducer.loading;
  const topicStates = useAppSelector(topicState);
  const topics = topicStates.topics;
  const topicTotal = topicStates.total;
  const [totalExam, setTotalExam] = useState<number>(0);

  useEffect(() => {
    loadCourse(params.slugChild || "");
  }, [params.slugChild]);

  useEffect(() => {
    if (course?.id) {
      loadTopicByCourse(course?.id || "", 1);
      loadTopicByCourse(course?.id || "", 2);
    }
  }, [course?.id]);

  const loadTopicByCourse = async (
    idCourse: string,
    type: number,
    parentId?: string
  ) => {
    try {
      if (type === TTCSconfig.TYPE_LESSON) {
        const result = await dispatch(
          requestLoadTopicByCourse({
            idCourse,
            type,
            parentId,
            status: TTCSconfig.STATUS_PUBLIC,
          })
        );
        unwrapResult(result);
      } else {
        const res = await apiLoadTopicByCourse({
          idCourse,
          type,
          parentId,
          status: TTCSconfig.STATUS_PUBLIC,
        });
        setTotalExam(res.data.total);
      }
    } catch (error) {
      notification.error({
        message: "server error!!",
        duration: 1.5,
      });
    }
  };

  const loadCourse = async (slugChild: string) => {
    try {
      const result = await dispatch(
        requestLoadCourseBySlug({
          slug: slugChild,
          status: TTCSconfig.STATUS_PUBLIC,
        })
      );
      unwrapResult(result);
    } catch (error) {
      notification.error({
        message: "server error!!",
        duration: 1.5,
      });
    }
  };

  return (
    <>
      <Header />

      <div className={cx("detail")}>
        <div className={cx("wide")}>
          <div className={cx("detail__container")}>
            <div className={cx("detail__wrapper")}>
              <div className={cx("detail__breadcrumb")}>
                <Breadcrumb separator="›">
                  <Breadcrumb.Item>
                    <NavLink to={"/"} className={cx("detail__breadcumb--link")}>
                      Trang chủ
                    </NavLink>
                  </Breadcrumb.Item>
                  {!loading && (
                    <>
                      <Breadcrumb.Item>
                        <NavLink
                          to={`/${course?.category?.slug}`}
                          className={cx("detail__breadcumb--link")}
                        >
                          {course?.category?.name}
                        </NavLink>
                      </Breadcrumb.Item>
                      <Breadcrumb.Item>
                        <NavLink
                          to={`/${course?.category?.slug}/${course?.slug}`}
                          className={cx("detail__breadcumb--link", "active")}
                        >
                          {course?.courseName}
                        </NavLink>
                      </Breadcrumb.Item>
                    </>
                  )}
                </Breadcrumb>
              </div>

              <Row
                style={{ width: "100%", margin: "0" }}
                gutter={16}
                className={cx("detail__row")}
              >
                <Col xl={16} lg={16} md={24} sm={24} xs={24}>
                  <h1 className={cx("detail__name")}>{course?.courseName}</h1>

                  <div className={cx("detail__des")}>
                    <p>{course?.shortDes}</p>
                  </div>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: course?.des ?? "",
                    }}
                    className={cx("detail__longDes")}
                  ></div>
                </Col>

                <Col xl={8} lg={8} md={24} sm={24} xs={24}>
                  <div className={cx("detail__badge")}>
                    <div className={cx("detail__image")}>
                      <img
                        src={course?.avatar || ""}
                        alt="course-avatar"
                        className={cx("detail__avatar")}
                      />
                    </div>
                    <h5 className={cx("detail__price")}>Miễn phí</h5>
                    <div className={cx("detail__group--btn")}>
                      <Row>
                        <Col xl={24} lg={24} md={12} sm={24} xs={24}>
                          <NavLink
                            to={`chuong-trinh-hoc/${course?.id}-1`}
                            className={cx("detail__btn--link")}
                          >
                            <button className={cx("detail__button", "btn1")}>
                              Chương trình học
                            </button>
                          </NavLink>
                        </Col>

                        <Col xl={24} lg={24} md={12} sm={24} xs={24}>
                          <NavLink
                            to={`de-kiem-tra/${course?.id}-2`}
                            className={cx("detail__btn--link")}
                          >
                            <button className={cx("detail__button", "btn2")}>
                              Đề kiểm tra
                            </button>
                          </NavLink>
                        </Col>
                      </Row>
                    </div>
                    <ul className={cx("detail__list")}>
                      <li className={cx("detail__item")}>
                        <FaLightbulb className={cx("detail__icon")} />
                        <span>Trình độ cơ bản</span>
                      </li>
                      <li className={cx("detail__item")}>
                        <FaFilm className={cx("detail__icon")} />
                        <span>
                          Tổng số <strong>{topicTotal}</strong> bài học
                        </span>
                      </li>
                      <li className={cx("detail__item")}>
                        <FaClock className={cx("detail__icon")} />
                        <span>
                          Thời lượng{" "}
                          <strong>
                            {moment(
                              topics
                                ?.map((topic, i) =>
                                  topic?.topicChildData.reduce(
                                    (accumulator, currentValue) =>
                                      accumulator +
                                      Number(currentValue.timeExam),
                                    0
                                  )
                                )
                                .reduce(
                                  (accumulator, currentValue) =>
                                    accumulator + currentValue,
                                  0
                                ) * 1000
                            ).format("mm:ss")}
                          </strong>
                        </span>
                      </li>
                      <li className={cx("detail__item")}>
                        <FaPencilRuler className={cx("detail__icon")} />
                        <span>
                          <strong>{totalExam}</strong> Đề kiểm tra
                        </span>
                      </li>
                      <li className={cx("detail__item")}>
                        <FaBatteryFull className={cx("detail__icon")} />
                        <span>Học mọi lúc, thi mọi nơi</span>
                      </li>
                    </ul>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CourseDetail;
