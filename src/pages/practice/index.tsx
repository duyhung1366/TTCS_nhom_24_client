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
} from "antd";
import TextArea from "antd/es/input/TextArea";
import classNames from "classnames/bind";
import { useCallback, useEffect, useState } from "react";
import CountDownRender from "../../components/FCCountdown";
import Countdown from "antd/es/statistic/Countdown";
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
  const [isRemake, setIsRemake] = useState(false);
  const [isOpenModelSubmit, setIsOpenModelSubmit] = useState(false);
  const [isOpenModelFeedback, setIsOpenModelFeedback] = useState(false);
  const [isOpenRemakeExam, setIsOpenRemakeExam] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [correctQuestions, setCorrectQuestions] = useState<String[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
  const [selectedFeedback, setSelectFeedback] = useState<Number[]>([]);
  const [textFeedback, setTextFeedback] = useState<string>("");
  const [idQuestion, setIdQuestion] = useState<string>();
  const [timeCoundown, settimeCoundown] = useState<number>(moment().valueOf());

  // useEffect(() => {
  //   window.addEventListener("scroll", handleClockStick);
  //   return () => {
  //     window.removeEventListener("scroll", handleClockStick);
  //   };
  // }, []);

  useEffect(() => {
    if (userInfo?.progess?.find((o) => o.idTopic === topic?.id)) {
      userInfo?.progess?.forEach(
        (o) => o.idTopic === topic?.id && setSelectedQuestions(o.answers)
      );
      setIsRemake(true);
      setCorrect(0);
      setCorrectQuestions([]);
    } else {
      console.log("render else ");
      setSelectedQuestions([]);
      setIsRemake(false);
    }
  }, [topic?.id, userInfo]);

  useEffect(() => {
    loadQuestionByTopic(params.idChild || "", 1);
    loadCourse(params.slugChild || "");
    loadTopicById(params.idChild || "");
  }, [params.idChild, params.slugChild]);

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

  const handleOpenModelSubmit = () => {
    setIsOpenModelSubmit(true);
  };

  const handleOpenModelFeedback = () => {
    setIsOpenModelFeedback(true);
  };

  const handleSubmitOk = async () => {
    try {
      const result = await dispatch(
        requestUpdateStudiedForUser({
          idTopic: topic?.id || "",
          idUser: userInfo?._id || "",
          status: TTCSconfig.STATUS_LEARNED,
          timeStudy: 0,
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

  const handleFeedbackOk = async () => {
    try {
      if (textFeedback.trim() !== "") {
        const res = await apiCreateFeedback({
          content: textFeedback.trim(),
          idQuestion: idQuestion,
          idCourse: course?.id,
          type: selectedFeedback,
          idUser: userInfo?._id,
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
    setIsOpenRemakeExam(false);
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

  const handleFinish = useCallback(handleSubmitOk, []);

  const handleRemakeExam = () => {
    setSelectedQuestions([]);
    setIsOpenRemakeExam(false);
    setIsRemake(false);
    settimeCoundown(moment().valueOf() + (topic?.timeExam || 0) * 1000 * 60);
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
                      {/* <CountDownRender
                        count={!isRemake ? 0.2 : 0}
                        onFinish={handleFinish}
                      /> */}
                      <Countdown
                        // value={moment().valueOf() + count * 1000 * 60}
                        value={!isRemake ? timeCoundown : 0}
                        onFinish={async () => {
                          // await handleSubmitOk();
                        }}
                      />
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
                                    handleOpenModelFeedback();
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
                                    {qs.question}
                                  </div>
                                </div>

                                <div className={cx("game__view--quiz-choices")}>
                                  <div className={cx("quiz-choices__item")}>
                                    <Space direction="vertical">
                                      {qs.answer?.map((item, i) => {
                                        return (
                                          <Radio
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
                                            disabled={isRemake}
                                          >
                                            <div
                                              className={cx(
                                                "quiz-choices__item--answer"
                                              )}
                                            >
                                              {answers[item.index]}. {item.text}
                                            </div>
                                          </Radio>
                                        );
                                      })}
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
                                <a href={`#${o.id}`}>
                                  <span
                                    className={
                                      selectedQuestions.find(
                                        (c) => c.idQuestion === o.id
                                      )
                                        ? cx("question-item__bground", "active")
                                        : cx("question-item__bground")
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

                      {isRemake && (
                        <div className={cx("practice__palette--review")}>
                          {userInfo?.progess?.map(
                            (o) =>
                              o.idTopic === topic?.id && (
                                <>
                                  <div className={cx("exam__panel--score")}>
                                    <FaStar
                                      style={{
                                        color: "#ffe644",
                                        fontSize: "8rem",
                                      }}
                                    />
                                    <span>{o.score}</span>
                                  </div>
                                  <div className={cx("exam__panel--body")}>
                                    <div className={cx("exam__panel--correct")}>
                                      <FaCheckCircle
                                        style={{ color: "#33cd99" }}
                                      />
                                      <span>{o.correctQuestion}</span>
                                    </div>
                                    <div
                                      className={cx("exam__panel--inCorrect")}
                                    >
                                      <FaTimesCircle
                                        style={{ color: "#ff4747" }}
                                      />
                                      <span>
                                        {totalQuestion - o.correctQuestion}
                                      </span>
                                    </div>
                                    <div className={cx("exam__panel--time")}>
                                      <FaClock style={{ color: "#ffba34" }} />
                                      <span>
                                        {moment(o.timeStudy).format("mm:ss")}
                                      </span>
                                    </div>
                                  </div>
                                </>
                              )
                          )}
                        </div>
                      )}
                      <div className={cx("practice__palette--footer")}>
                        {isRemake ? (
                          <div className={cx("btn-group")}>
                            <button
                              className={cx("btn", "btn__submit")}
                              onClick={() => setIsOpenRemakeExam(true)}
                            >
                              Làm lại
                            </button>
                            <button
                              className={cx("btn")}
                              onClick={() => {
                                navigate(-1);
                              }}
                            >
                              Thoát
                            </button>
                          </div>
                        ) : (
                          <div className={cx("btn-group")}>
                            <button
                              className={cx("btn", "btn__submit")}
                              onClick={handleOpenModelSubmit}
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
                <div className={cx("practice__subnav--main")}>
                  {isRemake ? (
                    <>
                      <div
                        className={cx("practice__subnav--item")}
                        onClick={() => {
                          navigate(-1);
                        }}
                      >
                        <FaSignOutAlt
                          className={cx("practice__subnav--item-icon")}
                        />
                        <div className={cx("practice__subnav--item-label")}>
                          Thoát
                        </div>
                      </div>
                      <div
                        className={cx("practice__subnav--item")}
                        onClick={() => setIsOpenRemakeExam(true)}
                      >
                        <FaUndoAlt
                          className={cx("practice__subnav--item-icon")}
                        />
                        <div className={cx("practice__subnav--item-label")}>
                          Làm lại
                        </div>
                      </div>
                    </>
                  ) : (
                    <div
                      className={cx("practice__subnav--item")}
                      onClick={handleOpenModelSubmit}
                    >
                      <FaRegCheckCircle
                        className={cx("practice__subnav--item-icon")}
                      />
                      <div className={cx("practice__subnav--item-label")}>
                        Nộp bài
                      </div>
                    </div>
                  )}

                  <div
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
                  </div>
                  <Drawer
                    className={cx("practice__drawer")}
                    placement={"bottom"}
                    onClose={handleCloseQuestionList}
                    open={openQuestionList}
                  >
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
                              <a href={`#${o.id}`}>
                                <span
                                  className={
                                    selectedQuestions.find(
                                      (c) => c.idQuestion === o.id
                                    )
                                      ? cx("question-item__bground", "active")
                                      : cx("question-item__bground")
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
                </div>
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
                <p>Bạn có chắc chắn muốn nộp bài làm của mình không?</p>
              </Modal>

              <Modal
                className={cx("modal", "modal__submit")}
                title="Làm lại"
                open={isOpenRemakeExam}
                onOk={handleRemakeExam}
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
                          selectedFeedback.find((c) => c === o?.type) &&
                          cx("selected")
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
