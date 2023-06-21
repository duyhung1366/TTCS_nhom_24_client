import { unwrapResult } from "@reduxjs/toolkit";
import {
  Breadcrumb,
  Button,
  Col,
  Drawer,
  Modal,
  notification,
  Progress,
  Radio,
  Row,
  Space,
  Statistic,
  StatisticProps,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import classNames from "classnames/bind";
import { useEffect, useRef, useState } from "react";
import {
  FaCheckCircle,
  FaClock,
  FaMarker,
  FaRegCheckCircle,
  FaRegClock,
  FaRegQuestionCircle,
  FaSignOutAlt,
  FaStar,
  FaTimesCircle,
  FaUndoAlt,
} from "react-icons/fa";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { apiCreateFeedback } from "../../api/feedback";
import Header from "../../components/header";
import { useAppDispatch, useAppSelector } from "../../redux/hook";
import {
  courseState,
  requestLoadCourseBySlug,
} from "../../redux/slices/courseSlice";
import {
  QuestionState,
  requestLoadQuestionsByIdTopic,
} from "../../redux/slices/questionSlice";
import {
  requestLoadTopicById,
  topicState,
} from "../../redux/slices/topicSlice";
import {
  authState,
  requestUpdateStudiedForUser,
} from "../../redux/slices/userSlice";
import TTCSconfig from "../../submodule/common/config";
import { answers, feedbackChild } from "../../utils/contants";
import styles from "./practice.module.scss";
import moment from "moment";

const cx = classNames.bind(styles);

const PracticePages = () => {
  const params = useParams();
  const dispatch = useAppDispatch();
  const topicStates = useAppSelector(topicState);
  const topic = topicStates.topicInfo;
  const courseReducer = useAppSelector(courseState);
  const course = courseReducer.course;
  const loading = courseReducer.loading;
  const questionStates = useAppSelector(QuestionState);
  const questions = questionStates.questions;
  const totalQuestion = questionStates.total;
  const navigate = useNavigate();
  const userInfo = useAppSelector(authState).userInfo;

  const [clockStick, setClockStick] = useState(false);
  const [openQuestionList, setOpenQuestionList] = useState(false);
  const [isReview, setIsReview] = useState(false);
  const [statusLearn, setStatusLearn] = useState<any>(0);
  const [isOpenModelSubmit, setIsOpenModelSubmit] = useState(false);
  const [isOpenModelFeedback, setIsOpenModelFeedback] = useState(false);
  const [isOpenReviewExam, setIsOpenReviewExam] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [correctQuestions, setCorrectQuestions] = useState<string[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
  const [selectedFeedback, setSelectFeedback] = useState<number[]>([]);
  const [textFeedback, setTextFeedback] = useState<string>("");
  const [idQuestion, setIdQuestion] = useState<string>();
  const [timeCoundown, setTimeCoundown] = useState<number>(moment().valueOf());
  const [timeRemake, setTimeRemake] = useState<any>(0);
  // const [progress, setProgress] = useState<any[]>([]);

  const timePratice = useRef<any>();
  const { Countdown } = Statistic;
  useEffect(() => {
    window.addEventListener("scroll", handleClockStick);
    return () => {
      window.removeEventListener("scroll", handleClockStick);
    };
  }, []);

  useEffect(() => {
    if (params.id) {
      const arg = params.id.split("-");
      // setProgress({ ...userInfo?.progress }[arg[0]]);
    }
    loadQuestionByTopic(params.idChild || "", 1);
    loadCourse(params.slugChild || "");
    loadTopicById(params.idChild || "");
  }, [params.idChild, params.slugChild, params.id]);

  useEffect(() => {
    const progress = { ...userInfo?.progress };
    if (progress[course?.id || ""]?.find((o) => o.idTopic === params.idChild)) {
      progress[course?.id || ""]?.find(
        (o) =>
          o.idTopic === params.idChild && setSelectedQuestions(o.answers || [])
      );
      // setTimeRemake(
      //   progress[course?.id || ""]?.find((o) => o.idTopic === params.idChild)?.timeStudy
      // );
      setStatusLearn(
        progress[course?.id || ""]?.find((o) => o.idTopic === params.idChild)
          ?.status
      );
      setIsReview(true);
      setCorrect(0);
      setCorrectQuestions([]);
    } else {
      setStatusLearn(0);
      setSelectedQuestions([]);
      setIsReview(false);
      setTimeCoundown(Date.now() + (topic?.timeExam || 0) * 1000 * 60);
    }
  }, [params.idChild, userInfo, topic?.id]);

  // useEffect(() => {
  //   if (!isReview) {
  //     return () => {
  //       window.confirm(
  //         "Bạn chưa nộp bài! Câu trả lời của bạn sẽ không được lưu lại. Bạn có chắc muốn rời khỏi không?"
  //       );
  //       // handleLoadPage();
  //     };
  //   }
  // }, []);

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

  const handleClockStick = () => {
    if (window !== undefined) {
      let windowHeight = window.scrollY;
      windowHeight > 180
        ? setClockStick(!clockStick)
        : setClockStick(clockStick);
    }
  };

  const loadQuestionByTopic = async (idTopic: string, status: number) => {
    try {
      const result = await dispatch(
        requestLoadQuestionsByIdTopic({ idTopic, status })
      );
      unwrapResult(result);
    } catch (error) {
      notification.error({
        message: "lỗi server, không tải được câu hỏi",
        duration: 1.5,
      });
    }
  };

  const loadTopicById = async (id: string) => {
    try {
      const result = await dispatch(requestLoadTopicById({ id }));
      unwrapResult(result);
    } catch (error) {
      notification.error({
        message: "lỗi server, không tải được câu hỏi",
        duration: 1.5,
      });
    }
  };

  const handleCloseQuestionList = () => {
    setOpenQuestionList(false);
  };

  const handleShowQuestionList = () => {
    setOpenQuestionList(!openQuestionList);
  };

  const handleSubmitOk = async () => {
    try {
      const result = await dispatch(
        requestUpdateStudiedForUser({
          idTopic: topic?.id || "",
          idCourse: course?.id || "",
          idUser: userInfo?._id || "",
          status: TTCSconfig.STATUS_LEARNED,
          timeStudy: timePratice.current,
          score: Math.round((correct / totalQuestion) * 100) / 10,
          correctQuestion: correct,
          answers: selectedQuestions,
        })
      );
      unwrapResult(result);
    } catch (error) {
      notification.error({
        message: "server error!!",
        duration: 1.5,
      });
    }
    setIsOpenModelSubmit(false);
  };

  const handleLoadPage = async () => {
    try {
      const result = await dispatch(
        requestUpdateStudiedForUser({
          idTopic: topic?.id || "",
          idCourse: course?.id || "",
          idUser: userInfo?._id || "",
          status: TTCSconfig.STATUS_LEARNING,
          timeStudy: timePratice.current,
          answers: selectedQuestions,
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

  const handleFeedbackOk = async () => {
    try {
      if (textFeedback.trim() !== "") {
        const res = await apiCreateFeedback({
          content: textFeedback.trim(),
          idQuestion: idQuestion,
          idCourse: course?.id,
          type: selectedFeedback,
          idUser: userInfo?._id,
          status: TTCSconfig.STATUS_PRIVATE,
        });
      }
    } catch (error) {
      notification.error({
        message: "cập nhật không được",
        duration: 1.5,
      });
    }
    setTextFeedback("");
    handleCancel();
  };

  const handleCancel = () => {
    setIsOpenModelSubmit(false);
    setIsOpenModelFeedback(false);
    setIsOpenReviewExam(false);
    setSelectFeedback([]);
    setTextFeedback("");
    setCorrect(0);
    setCorrectQuestions([]);
  };

  const handleMark = (idQuestion: string, isCheck: boolean) => {
    if (isCheck) {
      setCorrectQuestions([...correctQuestions, idQuestion]);
      setCorrect(correct + 1);
    } else if (correctQuestions.find((o) => o === idQuestion)) {
      setCorrect(correct - 1);
      setCorrectQuestions(correctQuestions.filter((o) => o !== idQuestion));
    }
  };

  const handlSaveSelected = (idQuestion: string, idAnswer: string) => {
    if (selectedQuestions.find((o) => o.idQuestion === idQuestion)) {
      setSelectedQuestions([
        ...selectedQuestions.filter((c) => c.idQuestion !== idQuestion),
        {
          idQuestion,
          idAnswer,
        },
      ]);
    } else {
      setSelectedQuestions((o) => [
        ...o,
        {
          idQuestion,
          idAnswer,
        },
      ]);
    }
  };

  const handleReviewExam = () => {
    if (statusLearn === TTCSconfig.STATUS_LEARNED) {
      setSelectedQuestions([]);
      setStatusLearn(0);
      setIsOpenReviewExam(false);
      setIsReview(false);
      setTimeCoundown(Date.now() + (topic?.timeExam || 0) * 1000 * 60);
    }
    // else if (statusLearn === TTCSconfig.STATUS_LEARNING) {
    //   setIsOpenReviewExam(false);
    //   setIsReview(false);
    //   setCorrect(
    //     selectedQuestions.map((o) => {
    //       questions.map((c) =>
    //         c.answer.find((an) => an._id === o.idAnswer && an.isResult)
    //       );
    //     }).length
    //   );
    //   // setTimeCoundown(Date.now() + (topic?.timeExam || 0) * 1000 * 60);
    //   setTimeCoundown(Date.now() + (timeRemake || 0) * 1000 * 60);
    // }
  };

  return (
    <>
      <Header />
      <div className={cx("practice")}>
        <div className={cx("wide")}>
          <div className={cx("practice__wrapper")}>
            <div className={cx("practice__container")}>
              <div className={cx("practice__breadcumb")}>
                <Breadcrumb separator="›">
                  <Breadcrumb.Item>
                    <NavLink
                      to={"/"}
                      className={cx("practice__breadcumb--link")}
                    >
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
                          className={cx("detail__breadcumb--link")}
                        >
                          {course?.courseName}
                        </NavLink>
                      </Breadcrumb.Item>
                      <Breadcrumb.Item>
                        <NavLink
                          to={`/${course?.category?.slug}/${course?.slug}/de-kiem-tra/${params.id}`}
                          className={cx("exam__breadcumb--link")}
                        >
                          Đề kiểm tra
                        </NavLink>
                      </Breadcrumb.Item>
                      <Breadcrumb.Item>
                        <NavLink
                          to={`/${course?.category?.slug}/${course?.slug}/de-kiem-tra/${params.id}`}
                          className={cx("practice__breadcumb--link", "active")}
                        >
                          {topic?.name}
                        </NavLink>
                      </Breadcrumb.Item>
                    </>
                  )}
                </Breadcrumb>
              </div>

              <h1 className={cx("practice__heading")}>{topic?.name}</h1>

              <Row gutter={10} className={cx("practice__view")}>
                <Col xl={16} lg={16} md={24} sm={24} xs={24}>
                  <Row
                    className={
                      clockStick
                        ? cx("practice__clock--panel", "stick")
                        : cx("practice__clock--panel")
                    }
                    onScroll={handleClockStick}
                  >
                    <FaRegClock className={cx("practice__clock--icon")} />
                    <span className={cx("practice__clock--time")}>
                      {/* {!isReview && ( */}
                      <Countdown
                        value={!isReview ? timeCoundown : 0}
                        onFinish={handleSubmitOk}
                        onChange={(val: StatisticProps["value"]) => {
                          timePratice.current = val;
                        }}
                      />
                      {/* )} */}
                    </span>
                  </Row>

                  <div>
                    {questions.length > 0 &&
                      questions?.map((qs, i) => {
                        return (
                          <Row
                            id={qs.id}
                            className={cx("practice__practice")}
                            key={qs.id}
                          >
                            <div className={cx("practice__practice--item")}>
                              <div className={cx("feedback-icon--wrapper")}>
                                <FaMarker
                                  className={cx("feedback-icon")}
                                  onClick={() => {
                                    setIsOpenModelFeedback(true);
                                    setIdQuestion(qs?.id);
                                  }}
                                />
                              </div>
                              <div className={cx("game__view")}>
                                <div className={cx("game__view--question")}>
                                  <div
                                    className={cx("game__view--question-index")}
                                  >
                                    <span>{i + 1}.</span>
                                  </div>
                                  <div
                                    className={cx("game__view--question-text")}
                                  >
                                    <div
                                      className={cx("category__summary")}
                                      dangerouslySetInnerHTML={{
                                        __html: qs.question ?? "",
                                      }}
                                    />
                                  </div>
                                </div>

                                <div className={cx("game__view--quiz-choices")}>
                                  <div className={cx("quiz-choices__item")}>
                                    <Space direction="vertical">
                                      {qs.answer?.map((item, i) => {
                                        return (
                                          <Radio
                                            className={
                                              isReview
                                                ? statusLearn ===
                                                    TTCSconfig.STATUS_LEARNED &&
                                                  (item?.isResult
                                                    ? cx(
                                                        "quiz-choices__item--radio",
                                                        "correct"
                                                      )
                                                    : selectedQuestions.find(
                                                        (o) =>
                                                          o.idAnswer.toString() ===
                                                          item?._id?.toString()
                                                      ) &&
                                                      cx(
                                                        "quiz-choices__item--radio",
                                                        "inCorrect"
                                                      ))
                                                : cx(
                                                    "quiz-choices__item--radio"
                                                  )
                                            }
                                            value={item}
                                            key={i}
                                            checked={
                                              !!selectedQuestions.find(
                                                (o) =>
                                                  o.idAnswer.toString() ===
                                                  item?._id?.toString()
                                              )
                                            }
                                            onClick={(e) => {
                                              handlSaveSelected(
                                                qs?.id || "",
                                                item?._id || ""
                                              );
                                              handleMark(
                                                qs?.id || "",
                                                item?.isResult
                                              );
                                            }}
                                            disabled={isReview}
                                          >
                                            <div
                                              className={cx(
                                                "quiz-choices__item--answer"
                                              )}
                                            >
                                              {answers[item.index]}.&nbsp;
                                              <span
                                                dangerouslySetInnerHTML={{
                                                  __html: item.text ?? "",
                                                }}
                                              ></span>
                                            </div>
                                          </Radio>
                                        );
                                      })}

                                      {isReview &&
                                        statusLearn ===
                                          TTCSconfig.STATUS_LEARNED && (
                                          <div className={cx("quiz__explain")}>
                                            {qs.hint && (
                                              <div
                                                className={cx(
                                                  "quiz__explain--item"
                                                )}
                                              >
                                                <p>Giải thích</p>
                                              </div>
                                            )}

                                            {selectedQuestions.find(
                                              (o) => o.idQuestion === qs.id
                                            ) ? (
                                              qs.answer?.find(
                                                (item) =>
                                                  item?.isResult &&
                                                  selectedQuestions.find(
                                                    (o) =>
                                                      o.idAnswer.toString() ===
                                                      item?._id?.toString()
                                                  )
                                              ) ? (
                                                <p style={{ color: "#33cd99" }}>
                                                  Bạn chọn đáp án đúng
                                                </p>
                                              ) : (
                                                <p style={{ color: "#ff4747" }}>
                                                  Bạn chọn đáp án sai
                                                </p>
                                              )
                                            ) : (
                                              <p style={{ color: "#ff4747" }}>
                                                Bạn chưa chọn đáp án
                                              </p>
                                            )}

                                            {qs.hint && (
                                              <div
                                                className={cx(
                                                  "quiz__explain--item"
                                                )}
                                              >
                                                <div
                                                  dangerouslySetInnerHTML={{
                                                    __html: qs.hint ?? "",
                                                  }}
                                                ></div>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                    </Space>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Row>
                        );
                      })}
                  </div>
                </Col>

                <Col xl={8} lg={8} md={0} sm={0} xs={0}>
                  <div className={cx("practice__palette--panel")}>
                    <div className={cx("practice__palette--main")}>
                      <div className={cx("practice__p alette--header")}>
                        <div className={cx("practice__palette--title")}>
                          Bảng câu hỏi
                        </div>
                      </div>

                      <div className={cx("practice__palette--body")}>
                        <div className={cx("practice__palette--progress")}>
                          <Progress
                            percent={
                              (selectedQuestions.length / totalQuestion) * 100
                            }
                            status="active"
                            strokeColor={"#009d9d"}
                            showInfo={false}
                          />
                          <div
                            className={cx("practice__palette--progress-title")}
                          >
                            {selectedQuestions.length}/{totalQuestion}
                          </div>
                        </div>

                        <div
                          className={cx("practice__palette--question-list")}
                          style={
                            isReview ? { height: "30vh" } : { height: "60vh" }
                          }
                        >
                          <Row
                            style={{
                              marginTop: "0.4rem",
                            }}
                            gutter={[0, 16]}
                          >
                            {questions?.map((o, i) =>
                              isReview ? (
                                <Col
                                  span={3}
                                  className={cx("question-item")}
                                  key={i}
                                >
                                  <a href={`#${o.id}`}>
                                    <span
                                      className={
                                        statusLearn ===
                                        TTCSconfig.STATUS_LEARNED
                                          ? o.answer?.find(
                                              (item) =>
                                                item?.isResult &&
                                                selectedQuestions.find(
                                                  (o) =>
                                                    o.idAnswer.toString() ===
                                                    item?._id?.toString()
                                                )
                                            )
                                            ? cx(
                                                "question-item__bground",
                                                "green",
                                                "active"
                                              )
                                            : cx(
                                                "question-item__bground",
                                                "red",
                                                "active"
                                              )
                                          : cx("question-item__bground")
                                      }
                                    >
                                      {i + 1}
                                    </span>
                                  </a>
                                </Col>
                              ) : (
                                <Col
                                  span={3}
                                  className={cx("question-item")}
                                  key={i}
                                >
                                  <a href={`#${o.id}`}>
                                    <span
                                      className={
                                        selectedQuestions.find(
                                          (c) => c.idQuestion === o.id
                                        )
                                          ? cx(
                                              "question-item__bground",
                                              "active"
                                            )
                                          : cx("question-item__bground")
                                      }
                                    >
                                      {i + 1}
                                    </span>
                                  </a>
                                </Col>
                              )
                            )}
                          </Row>
                        </div>
                      </div>

                      {isReview &&
                        statusLearn === TTCSconfig.STATUS_LEARNED && (
                          <div className={cx("practice__palette--review")}>
                            {{ ...userInfo?.progress }[course?.id || ""]?.map(
                              (o, i) =>
                                o.idTopic === topic?.id && (
                                  <div key={i}>
                                    <div className={cx("exam__panel--score")}>
                                      <FaStar
                                        style={{
                                          color: "#ffe644",
                                          fontSize: "8rem",
                                        }}
                                      />
                                      <span>{o.score}</span>
                                    </div>
                                    <Row
                                      className={cx("exam__panel--body")}
                                      gutter={[16, 16]}
                                    >
                                      <Col
                                        span={7}
                                        className={cx(
                                          "exam__panel--body-item",
                                          "exam__panel--correct"
                                        )}
                                      >
                                        <FaCheckCircle
                                          style={{
                                            color: "#33cd99",
                                            fontSize: "1.8rem",
                                          }}
                                        />
                                        <span style={{ fontSize: "1.4rem" }}>
                                          Câu đúng
                                        </span>
                                        <span style={{ fontSize: "2.2rem" }}>
                                          {o.correctQuestion}
                                        </span>
                                      </Col>
                                      <Col
                                        span={7}
                                        className={cx(
                                          "exam__panel--body-item",
                                          "exam__panel--inCorrect"
                                        )}
                                      >
                                        <FaTimesCircle
                                          style={{
                                            color: "#ff4747",
                                            fontSize: "1.8rem",
                                          }}
                                        />
                                        <span style={{ fontSize: "1.4rem" }}>
                                          Câu sai
                                        </span>
                                        <span style={{ fontSize: "2.2rem" }}>
                                          {totalQuestion - o.correctQuestion}
                                        </span>
                                      </Col>
                                      <Col
                                        span={7}
                                        className={cx(
                                          "exam__panel--body-item",
                                          "exam__panel--time"
                                        )}
                                      >
                                        <FaClock
                                          style={{
                                            color: "#ffba34",
                                            fontSize: "1.8rem",
                                          }}
                                        />
                                        <span style={{ fontSize: "1.4rem" }}>
                                          Thời gian
                                        </span>
                                        <span style={{ fontSize: "2.2rem" }}>
                                          {moment(
                                            Math.abs(
                                              (topic?.timeExam || 0) * 60000 -
                                                o.timeStudy
                                            )
                                          ).format("mm:ss")}
                                        </span>
                                      </Col>
                                    </Row>
                                  </div>
                                )
                            )}
                          </div>
                        )}
                      <div className={cx("practice__palette--footer")}>
                        {isReview ? (
                          statusLearn === TTCSconfig.STATUS_LEARNED ? (
                            <div className={cx("btn-group")}>
                              <button
                                className={cx("btn", "btn__submit")}
                                onClick={() => setIsOpenReviewExam(true)}
                              >
                                Làm lại
                              </button>
                              <button
                                className={cx("btn")}
                                onClick={() => {
                                  navigate(
                                    `/${course?.category?.slug}/${course?.slug}/de-kiem-tra/${params.id}`
                                  );
                                }}
                              >
                                Thoát
                              </button>
                            </div>
                          ) : (
                            <div className={cx("btn-group")}>
                              <button
                                className={cx("btn", "btn__submit")}
                                onClick={() => setIsOpenReviewExam(true)}
                              >
                                Làm tiếp
                              </button>
                              <button
                                className={cx("btn")}
                                onClick={() => {
                                  navigate(
                                    `/${course?.category?.slug}/${course?.slug}/de-kiem-tra/${params.id}`
                                  );
                                }}
                              >
                                Thoát
                              </button>
                            </div>
                          )
                        ) : (
                          <div className={cx("btn-group")}>
                            <button
                              className={cx("btn", "btn__submit")}
                              onClick={() => setIsOpenModelSubmit(true)}
                            >
                              Nộp bài
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              <div className={cx("practice__subnav")}>
                <Row className={cx("practice__subnav--main")}>
                  {isReview ? (
                    <>
                      <Col
                        span={8}
                        className={cx("practice__subnav--item")}
                        onClick={() => {
                          navigate(
                            `/${course?.category?.slug}/${course?.slug}/de-kiem-tra/${params.id}`
                          );
                        }}
                      >
                        <FaSignOutAlt
                          className={cx("practice__subnav--item-icon")}
                        />
                        <div className={cx("practice__subnav--item-label")}>
                          Thoát
                        </div>
                      </Col>
                      <Col
                        span={8}
                        className={cx("practice__subnav--item")}
                        onClick={() => setIsOpenReviewExam(true)}
                      >
                        <FaUndoAlt
                          className={cx("practice__subnav--item-icon")}
                        />
                        <div className={cx("practice__subnav--item-label")}>
                          Làm lại
                        </div>
                      </Col>
                    </>
                  ) : (
                    <Col
                      span={8}
                      className={cx("practice__subnav--item")}
                      onClick={() => setIsOpenModelSubmit(true)}
                    >
                      <FaRegCheckCircle
                        className={cx("practice__subnav--item-icon")}
                      />
                      <div className={cx("practice__subnav--item-label")}>
                        Nộp bài
                      </div>
                    </Col>
                  )}

                  <Col
                    span={8}
                    className={
                      openQuestionList
                        ? cx("practice__subnav--item", "active")
                        : cx("practice__subnav--item")
                    }
                    onClick={handleShowQuestionList}
                  >
                    <FaRegQuestionCircle
                      className={cx("practice__subnav--item-icon")}
                    />
                    <div className={cx("practice__subnav--item-label")}>
                      Danh sách câu hỏi
                    </div>
                  </Col>
                  <Drawer
                    className={cx("practice__drawer")}
                    placement={"bottom"}
                    onClose={handleCloseQuestionList}
                    open={openQuestionList}
                    height={"80%"}
                    zIndex={100}
                  >
                    <div className={cx("practice__palette--body")}>
                      {isReview && (
                        <div className={cx("practice__palette--review")}>
                          {{ ...userInfo?.progress }[course?.id || ""]?.map(
                            (o, i) =>
                              o.idTopic === topic?.id && (
                                <div key={i}>
                                  <div className={cx("exam__panel--score")}>
                                    <FaStar
                                      style={{
                                        color: "#ffe644",
                                        fontSize: "8rem",
                                      }}
                                    />
                                    <span>{o.score}</span>
                                  </div>
                                  <Row
                                    className={cx("exam__panel--body")}
                                    gutter={[16, 16]}
                                  >
                                    <Col
                                      span={7}
                                      className={cx(
                                        "exam__panel--body-item",
                                        "exam__panel--correct"
                                      )}
                                    >
                                      <FaCheckCircle
                                        style={{
                                          color: "#33cd99",
                                          fontSize: "1.8rem",
                                        }}
                                      />
                                      <span style={{ fontSize: "1.4rem" }}>
                                        Câu đúng
                                      </span>
                                      <span style={{ fontSize: "2.2rem" }}>
                                        {o.correctQuestion || 0}
                                      </span>
                                    </Col>
                                    <Col
                                      span={7}
                                      className={cx(
                                        "exam__panel--body-item",
                                        "exam__panel--inCorrect"
                                      )}
                                    >
                                      <FaTimesCircle
                                        style={{
                                          color: "#ff4747",
                                          fontSize: "1.8rem",
                                        }}
                                      />
                                      <span style={{ fontSize: "1.4rem" }}>
                                        Câu sai
                                      </span>
                                      <span style={{ fontSize: "2.2rem" }}>
                                        {totalQuestion - o.correctQuestion}
                                      </span>
                                    </Col>
                                    <Col
                                      span={7}
                                      className={cx(
                                        "exam__panel--body-item",
                                        "exam__panel--time"
                                      )}
                                    >
                                      <FaClock
                                        style={{
                                          color: "#ffba34",
                                          fontSize: "1.8rem",
                                        }}
                                      />
                                      <span style={{ fontSize: "1.4rem" }}>
                                        Thời gian
                                      </span>
                                      <span style={{ fontSize: "2.2rem" }}>
                                        {moment(
                                          Math.abs(
                                            (topic?.timeExam || 0) * 60000 -
                                              o.timeStudy
                                          )
                                        ).format("mm:ss")}
                                      </span>
                                    </Col>
                                  </Row>
                                </div>
                              )
                          )}
                        </div>
                      )}
                      <div className={cx("practice__palette--progress")}>
                        <Progress
                          percent={
                            (selectedQuestions.length / totalQuestion) * 100
                          }
                          status="active"
                          strokeColor={"#009d9d"}
                          showInfo={false}
                        />
                        <div
                          className={cx("practice__palette--progress-title")}
                        >
                          {selectedQuestions.length}/{totalQuestion}
                        </div>
                      </div>

                      <div className={cx("practice__palette--question-list")}>
                        <Row
                          style={{
                            marginTop: "0.4rem",
                          }}
                          gutter={[0, 16]}
                        >
                          {questions?.map((o, i) => (
                            <Col
                              span={3}
                              className={cx("question-item")}
                              key={i}
                            >
                              <a
                                href={`#${o.id}`}
                                onClick={handleCloseQuestionList}
                              >
                                <span
                                  className={
                                    o.answer?.find(
                                      (item) =>
                                        item?.isResult &&
                                        selectedQuestions.find(
                                          (o) =>
                                            o.idAnswer.toString() ===
                                            item?._id?.toString()
                                        )
                                    )
                                      ? cx(
                                          "question-item__bground",
                                          "green",
                                          "active"
                                        )
                                      : cx(
                                          "question-item__bground",
                                          "red",
                                          "active"
                                        )
                                  }
                                >
                                  {i + 1}
                                </span>
                              </a>
                            </Col>
                          ))}
                        </Row>
                      </div>
                    </div>
                  </Drawer>
                </Row>
              </div>

              <Modal
                className={cx("modal", "modal__submit")}
                title="Nộp bài"
                open={isOpenModelSubmit}
                onOk={handleSubmitOk}
                onCancel={handleCancel}
                okText={"Nộp bài"}
                cancelText={"Hủy"}
              >
                {selectedQuestions.length === totalQuestion ? (
                  <p>Bạn có chắc chắn muốn nộp bài làm của mình không?</p>
                ) : (
                  <p>
                    Bạn vẫn còn câu hỏi chưa trả lời. Bạn có chắc chắn muốn nộp
                    bài làm của mình không?
                  </p>
                )}
              </Modal>

              <Modal
                className={cx("modal", "modal__submit")}
                title="Làm lại"
                open={isOpenReviewExam}
                onOk={handleReviewExam}
                onCancel={handleCancel}
                okText={"Làm lại"}
                cancelText={"Hủy"}
              >
                <p>Bạn có chắc chắn muốn làm lại không?</p>
              </Modal>

              <Modal
                className={cx("modal", "modal__feedback")}
                title="BẠN ĐANG GẶP VẤN ĐỀ GÌ?"
                open={isOpenModelFeedback}
                onOk={handleFeedbackOk}
                onCancel={handleCancel}
                okText="Gửi phản hồi"
                footer={
                  textFeedback.trim() !== "" || selectedFeedback.length ? (
                    <Button
                      className={cx("btn__feedback")}
                      onClick={handleFeedbackOk}
                    >
                      Gửi phản hồi
                    </Button>
                  ) : (
                    <Button className={cx("btn__feedback")} disabled>
                      Gửi phản hồi
                    </Button>
                  )
                }
              >
                <Row gutter={[16, 16]} className={cx("modal__feedback--list")}>
                  {feedbackChild?.map((o, i) => (
                    <Col
                      key={i}
                      xl={8}
                      lg={8}
                      md={8}
                      sm={12}
                      xs={12}
                      className={cx("modal__feedback--item")}
                      onClick={() => {
                        if (!selectedFeedback.find((c) => c === o?.type)) {
                          setSelectFeedback([...selectedFeedback, o?.type]);
                        } else {
                          setSelectFeedback(
                            selectedFeedback.filter((c) => c !== o?.type)
                          );
                        }
                      }}
                    >
                      <span
                        className={
                          selectedFeedback.find((c) => c === o?.type)
                            ? cx("selected")
                            : ""
                        }
                      >
                        {o.text}
                      </span>
                    </Col>
                  ))}
                </Row>
                <TextArea
                  name="feedbackText"
                  autoSize={{
                    minRows: 4,
                    maxRows: 10,
                  }}
                  placeholder="Nhập vấn đề bạn đang mắc phải..."
                  style={{ minWidth: "100%" }}
                  onChange={(e) => {
                    setTextFeedback(e.target.value);
                  }}
                  value={textFeedback}
                  showCount
                  maxLength={500}
                />
                <div className={cx("modal__feedback--note")}>
                  Phản hồi của bạn sẽ được ghi nhận!
                </div>
              </Modal>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PracticePages;
