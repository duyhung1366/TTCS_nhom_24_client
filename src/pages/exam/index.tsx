import { Breadcrumb, Col, notification, Popconfirm, Row } from "antd";
import classNames from "classnames/bind";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import Footer from "../../components/footer";
import Header from "../../components/header";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  courseState,
  requestLoadCourseBySlug,
} from "../../redux/slices/courseSlice";
import styles from "./exam.module.scss";
import {
  FaChevronDown,
  FaChevronUp,
  FaRegClock,
  FaRegQuestionCircle,
} from "react-icons/fa";
import { BiChevronRight } from "react-icons/bi";
import { useEffect, useState } from "react";
import TTCSconfig from "../../submodule/common/config";
import { unwrapResult } from "@reduxjs/toolkit";
import {
  requestLoadTopicByCourse,
  topicState,
} from "../../redux/slices/topicSlice";
import { authState } from "../../redux/slices/userSlice";

const cx = classNames.bind(styles);

const ExamPages = () => {
  const dispatch = useAppDispatch();
  const params = useParams();
  const courseReducer = useAppSelector(courseState);
  const course = courseReducer.course;
  const loading = courseReducer.loading;
  const topicStates = useAppSelector(topicState);
  const topics = topicStates.topics;
  const loadingTopic = topicStates.loading;
  const userInfo = useAppSelector(authState).userInfo;
  const [indexOpenTopic, setIndexOpenTopic] = useState<number[]>([1]);
  const navigate = useNavigate();
  const [progress, setProgress] = useState<any[]>([]);

  useEffect(() => {
    if (params.id) {
      const arg = params.id.split("-");
      setProgress({ ...userInfo?.progress }[arg[0]]);
      if (Number(arg[1]) === TTCSconfig.TYPE_EXAM) {
        loadTopicByCourse(arg[0], Number(arg[1]));
      } else {
        navigate(-1);
      }
    }
    loadCourse(params.slugChild || "");
  }, [params.slugChild, params.id]);

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

  const loadTopicByCourse = async (
    idCourse: string,
    type: number,
    parentId?: string
  ) => {
    try {
      const result = await dispatch(
        requestLoadTopicByCourse({
          idCourse,
          type,
          parentId,
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
    <div>
      <Header />
      <div className={cx("exam")}>
        <div className={cx("wide")}>
          <div className={cx("exam__container")}>
            <div className={cx("exam__wrapper")}>
              <div className={cx("exam__breadcrumb")}>
                <Breadcrumb separator="›">
                  <Breadcrumb.Item>
                    <NavLink to={"/"} className={cx("exam__breadcumb--link")}>
                      Trang chủ
                    </NavLink>
                  </Breadcrumb.Item>
                  {!loading && (
                    <>
                      <Breadcrumb.Item>
                        <NavLink
                          to={`/${course?.category?.slug}`}
                          className={cx("exam__breadcumb--link")}
                        >
                          {course?.category?.name}
                        </NavLink>
                      </Breadcrumb.Item>
                      <Breadcrumb.Item>
                        <NavLink
                          to={`/${course?.category?.slug}/${course?.slug}`}
                          className={cx("exam__breadcumb--link")}
                        >
                          {course?.courseName}
                        </NavLink>
                      </Breadcrumb.Item>
                      <Breadcrumb.Item>
                        <NavLink
                          to={"#"}
                          className={cx("exam__breadcumb--link", "active")}
                        >
                          Đề kiểm tra
                        </NavLink>
                      </Breadcrumb.Item>
                    </>
                  )}
                </Breadcrumb>
              </div>

              <div>
                <h1 className={cx("exam__title")}>
                  Luyện đề trắc nghiệm {course?.courseName}
                </h1>
              </div>

              {!loadingTopic && (
                <div className={cx("exam__view")}>
                  {topics.length > 0 &&
                    topics?.map((data, i) => {
                      const dataChild = data.topicChildData;
                      return (
                        <div className={cx("exam__panel")} key={data.id}>
                          <div className={cx("exam__panel--item")}>
                            {indexOpenTopic.find((o) => o === i + 1) ? (
                              <div
                                className={cx("exam__panel--title")}
                                onClick={() => {
                                  const indexPrev = indexOpenTopic.filter(
                                    (o) => o !== i + 1
                                  );
                                  setIndexOpenTopic(indexPrev);
                                }}
                              >
                                <FaChevronUp className={cx("panel__icon")} />
                                <h3 className={cx("panel__text")}>
                                  {data?.name}
                                </h3>
                              </div>
                            ) : (
                              <div
                                className={cx("exam__panel--title")}
                                onClick={() => {
                                  setIndexOpenTopic([...indexOpenTopic, i + 1]);
                                }}
                              >
                                <FaChevronDown className={cx("panel__icon")} />
                                <h3 className={cx("panel__text")}>
                                  {data?.name}
                                </h3>
                              </div>
                            )}

                            <Row
                              gutter={[12, 12]}
                              className={
                                indexOpenTopic.find((o) => o === i + 1)
                                  ? cx("exam__appear")
                                  : cx("exam__appear", "hide")
                              }
                            >
                              {dataChild[0] &&
                                dataChild?.map(
                                  (dataChild, iChild) =>
                                    dataChild.status ===
                                      TTCSconfig.STATUS_PUBLIC && (
                                      <Col
                                        xl={12}
                                        lg={12}
                                        md={12}
                                        sm={24}
                                        xs={24}
                                        key={iChild}
                                      >
                                        <div
                                          className={cx("exam__panel--content")}
                                        >
                                          <span>{dataChild.name}</span>
                                          <div
                                            className={cx(
                                              "exam__panel--action"
                                            )}
                                          >
                                            <div
                                              className={cx(
                                                "panel--action-item"
                                              )}
                                            >
                                              <div>
                                                <FaRegQuestionCircle />
                                                <span>
                                                  {dataChild?.numQuestion} câu
                                                </span>
                                              </div>
                                              <div>
                                                <FaRegClock />
                                                <span>
                                                  {dataChild?.timeExam} phút
                                                </span>
                                              </div>
                                              {progress?.map(
                                                (o) =>
                                                  o.idTopic ===
                                                    dataChild.id && (
                                                    <div
                                                      className={cx(
                                                        "exam__panel--score"
                                                      )}
                                                      key={o.idTopic}
                                                    >
                                                      <span>
                                                        {o.score || 0} điểm
                                                      </span>
                                                    </div>
                                                  )
                                              )}
                                            </div>
                                            <Popconfirm
                                              placement="top"
                                              title="Bạn muốn làm đề này sao?"
                                              onConfirm={() =>
                                                navigate(`${dataChild.id}`)
                                              }
                                              okText="Yes"
                                              cancelText="No"
                                            >
                                              {progress?.find(
                                                (o) =>
                                                  o.idTopic === dataChild.id
                                              ) ? (
                                                <button
                                                  className={cx(
                                                    "exam__panel--btn",
                                                    "review"
                                                  )}
                                                >
                                                  <span>Xem lại</span>
                                                  <BiChevronRight
                                                    className={cx(
                                                      "exam__panel--icon"
                                                    )}
                                                  />
                                                </button>
                                              ) : (
                                                <button
                                                  className={cx(
                                                    "exam__panel--btn"
                                                  )}
                                                >
                                                  <span>Làm bài</span>
                                                  <BiChevronRight
                                                    className={cx(
                                                      "exam__panel--icon"
                                                    )}
                                                  />
                                                </button>
                                              )}
                                            </Popconfirm>
                                          </div>
                                        </div>
                                      </Col>
                                    )
                                )}
                            </Row>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ExamPages;
