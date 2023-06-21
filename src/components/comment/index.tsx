import { unwrapResult } from "@reduxjs/toolkit";
import {
  Avatar,
  Drawer,
  Dropdown,
  MenuProps,
  message,
  Modal,
  notification,
  Tooltip,
} from "antd";
import classNames from "classnames/bind";
import { Fragment, memo, useContext, useEffect, useRef, useState } from "react";
import { FaEllipsisH } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Editor } from "tinymce";
import { apiDeleteComment, apiLoadComments } from "../../api/comment";
import reactionBuon from "../../assets/img/reactionBuon.svg";
import reactionHaha from "../../assets/img/reactionHaha.svg";
import reactionLike from "../../assets/img/reactionLike.svg";
import reactionPhanno from "../../assets/img/reactionPhanno.svg";
import reactionThuong from "../../assets/img/reactionThuong.svg";
import reactionTim from "../../assets/img/reactionTim.svg";
import reactionWow from "../../assets/img/reactionWow.svg";
import { useAppDispatch } from "../../redux/hook";
import {
  commentState,
  requestSendReactionComment,
  requestUpdateComment,
  setComments,
} from "../../redux/slices/commentSlice";
import { authState } from "../../redux/slices/userSlice";
import TTCSconfig from "../../submodule/common/config";
import { Comment } from "../../submodule/models/comment";
import { Topic } from "../../submodule/models/topic";
import { AvatarIcon } from "../icons/icons";
import TinyMCEEditor from "../TinyMCE";
import styles from "./comment.module.scss";
import { RealtimeContext } from "../../App";
import moment from "moment";
import fallbackAvatar from "./../../assets/img/fallback-avt.jpg";

const cx = classNames.bind(styles);

const ReactType = [
  { icon: reactionLike, title: "Thích", name: "like" },
  { icon: reactionTim, title: "Yêu thích", name: "love" },
  { icon: reactionThuong, title: "Thương thương", name: "care" },
  { icon: reactionHaha, title: "Haha", name: "haha" },
  { icon: reactionWow, title: "Wow", name: "wow" },
  { icon: reactionBuon, title: "Buồn", name: "sad" },
  { icon: reactionPhanno, title: "Phẫn nộ", name: "angry" },
];

const items: MenuProps["items"] = [
  {
    label: "Báo cáo bình luận",
    key: "0",
  },
  {
    label: "Chỉnh sửa",
    key: "1",
  },
  {
    label: "Xóa",
    key: "2",
  },
];

type CommentProps = {
  placement: any;
  open: boolean;
  onClose: () => void;
  width: string | number;
  zIndex: number;
  className: string;
  dataTopicActive: Topic;
};

const FCComment = (props: CommentProps) => {
  const { dataTopicActive } = props;
  const drawerRef = useRef(null);
  const content = useRef<Editor>();
  const contentEditor = useRef<any>();
  const dispatch = useAppDispatch();
  const commentStates = useSelector(commentState);
  const userStates = useSelector(authState);
  const realtime = useContext(RealtimeContext);
  const [openComment, setOpenComment] = useState<boolean>(false);
  const [skip, setSkip] = useState(0);
  const [isTotalComment, setIsTotalComment] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number>();
  const [isDelete, setIsDelete] = useState<boolean>(false);
  const [commentInfo, setCommentInfo] = useState<Comment>();
  const [keyRandom, setKeyRandom] = useState<string>();
  const [isEditor, setIsEditor] = useState<boolean>(false);
  const [idEditorComment, setIdEditorComment] = useState<string>();
  const [valueEditor, setValueEditor] = useState<string>();
  const [valueCommentEditor, setValueCommentEditor] = useState<string>();

  useEffect(() => {
    if (skip) {
      handleLoadComment(TTCSconfig.LIMIT, skip);
    }

    if (commentStates.comments.length === commentStates.total) {
      setIsTotalComment(true);
    }
  }, [skip]);

  useEffect(() => {
    setSkip(0);
    setIsTotalComment(false);
  }, [dataTopicActive?.id]);

  const handleScroll = (e: any) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;

    if (scrollTop >= scrollHeight - clientHeight && !isTotalComment) {
      setSkip((prevSkip) => prevSkip + TTCSconfig.LIMIT);
    }
  };

  const handleLoadComment = async (limit?: number, skip?: number) => {
    try {
      const res = await apiLoadComments({
        idTopic: dataTopicActive?.id || "",
        limit,
        skip,
      });
      dispatch(setComments(res.data.data));
    } catch (error) {
      // console.log(error);
      notification.error({
        message: "lỗi server, không tải được dữ liệu",
        duration: 1.5,
      });
    }
  };

  const handleCreateComment = async () => {
    const text = content.current?.getContent();
    const idTopic = dataTopicActive.id;

    try {
      const res = await dispatch(
        requestUpdateComment(
          new Comment({
            content: text,
            idTopic,
            idUser: userStates.userInfo?._id,
            index: commentStates.comments.length + 1,
          })
        )
      );
      unwrapResult(res);
    } catch (error) {
      message.error("lỗi server, không gửi được comment");
    } finally {
      setOpenComment(false);
    }
  };

  const handleSendReactionComment = async (
    type: number,
    idComment: string | undefined
  ) => {
    try {
      if (!idComment || !userStates.userInfo?._id) {
        message.error("không cập nhật được !!");
        return;
      }
      const res = await dispatch(
        requestSendReactionComment({
          idComment,
          idUser: userStates.userInfo?._id,
          type,
        })
      );
      unwrapResult(res);
    } catch (error) {
      message.error("lỗi server !!");
    }
  };

  const hanldeDeleteComment = async (comment: Comment | undefined) => {
    try {
      setIsDelete(false);
      const res = await apiDeleteComment({
        idComment: comment?.id || "",
        idTopic: comment?.idTopic || "",
      });
    } catch (error) {
      message.error("lỗi server, không gửi được comment");
    }
  };

  const handleUpdateComment = async (comment: Comment) => {
    const text = contentEditor.current?.getContent();

    try {
      const res = await dispatch(
        requestUpdateComment({
          ...comment,
          content: text,
        })
      );
      unwrapResult(res);
      setIsEditor(false);
    } catch (error) {
      message.error("lỗi server, không gửi được comment");
    }
  };

  const onClickDropDown = async (props: {
    key: string;
    id?: string;
    content?: string;
  }) => {
    const { key, id, content } = props;

    if (key === "0") {
      notification.success({
        message: "Đã gửi báo cáo tới quản trị viên",
        duration: 1.5,
      });
    } else if (key === "1") {
      contentEditor.current?.setContent(content);
      setValueEditor(content);
      setIsEditor(true);
      setIdEditorComment(id);
      setKeyRandom(`${Math.random()}`);
    } else if (key === "2") {
      setIsDelete(true);
    }
  };

  const ItemComment = (comment: Comment, key: number) => {
    const { userInfo, content, react, id } = comment;
    const typeReaction = react?.find(
      (o) => o.idUser === userStates.userInfo?._id
    )?.type;
    const diffSeconds = moment().diff(comment.createDate, "seconds");
    const diffMinutes = moment().diff(comment.createDate, "minutes");
    const diffHours = moment().diff(comment.createDate, "hours");
    const diffDays = moment().diff(comment.createDate, "days");
    const diffMonths = moment().diff(comment.createDate, "months");

    return (
      <div className={cx("comment__detail")} key={key}>
        <div className={cx("comment__avt--wrapper")}>
          {userInfo?.avatar ? (
            <Avatar src={userInfo?.avatar} />
          ) : (
            <Avatar src={fallbackAvatar} />
          )}
        </div>

        <div className={cx("comment__detail--cmtbody")}>
          <div className={cx("comment__detail--cmtinner")}>
            <div className={cx("comment__detail--cmtwrapper")}>
              <div className={cx("comment__detail--cmtcontent")}>
                <div className={cx("comment__detail--heading")}>
                  <span>{userInfo?.name}</span>
                </div>
                {isEditor && idEditorComment === id ? (
                  <>
                    <TinyMCEEditor
                      editorRef={contentEditor}
                      height={250}
                      keyMCE={keyRandom}
                      value={valueEditor}
                      onChange={(value) => setValueCommentEditor(value)}
                    />
                    <div className={cx("comment__content--action")}>
                      <button
                        className={cx("comment__content--btn", "cancel-btn")}
                        onClick={() => {
                          setIsEditor(false);
                        }}
                      >
                        Huỷ
                      </button>
                      <button
                        className={
                          valueCommentEditor
                            ? cx("comment__content--btn", "accept-btn")
                            : cx("comment__content--btn", "disable-btn")
                        }
                        onClick={() => handleUpdateComment(comment)}
                      >
                        Lưu
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className={cx("comment__detail--text")}
                      dangerouslySetInnerHTML={{
                        __html: content,
                      }}
                    ></div>
                    {/* <div className={cx("comment__detail--showMore")}>
                    <strong>Mở rộng</strong>
                    <FaChevronDown
                      className={cx("comment__detail--icon")}
                    />
                    <strong>Thu nhỏ</strong>
                    <FaChevronUp className={cx("comment__detail--icon")} />
                  </div> */}
                    {react && react?.length > 0 && (
                      <div className={cx("comment__detail--react")}>
                        <Avatar.Group
                          maxCount={7}
                          className={cx("comment__detail--reactGroup")}
                          size={20}
                        >
                          {react?.map((item) => {
                            return <Avatar src={ReactType[item.type].icon} />;
                          })}
                        </Avatar.Group>
                        <div className={cx("comment__detail--reactNum")}>
                          {react?.length}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className={cx("comment__detail--cmttime")}>
                <div className={cx("comment__detail--create")}>
                  <div className={cx("comment__detail--createLeft")}>
                    <Tooltip
                      title={ReactType.map((reaction, key) => {
                        return (
                          <Fragment key={key}>
                            <Tooltip
                              title={reaction.title}
                              showArrow={false}
                              mouseEnterDelay={0.2}
                              mouseLeaveDelay={0}
                              overlayClassName={cx("reaction__title")}
                            >
                              <img
                                src={reaction.icon}
                                alt="cam xuc"
                                className={cx("reaction__icon")}
                                onClick={() =>
                                  handleSendReactionComment(key, id)
                                }
                              />
                            </Tooltip>
                          </Fragment>
                        );
                      })}
                      placement="topLeft"
                      trigger="hover"
                      showArrow={false}
                      overlayClassName={cx("tooltip__reactions")}
                    >
                      <span
                        // className={cx("comment__detail--liketext", {
                        //   "comment__detail--liketext--selected":
                        //     selectedReaction === null,
                        // })}
                        className={
                          typeof typeReaction === "undefined"
                            ? cx("comment__detail--liketext")
                            : cx(
                                "comment__detail--liketext--selected",
                                `${ReactType[typeReaction].name}`
                              )
                        }
                        onClick={() => {
                          typeof typeReaction !== "undefined"
                            ? handleSendReactionComment(typeReaction, id)
                            : handleSendReactionComment(0, id);
                        }}
                      >
                        {typeReaction ? ReactType[typeReaction].title : "Thích"}
                      </span>
                    </Tooltip>
                    ·
                    <span className={cx("comment__detail--replytext")}>
                      Trả lời
                    </span>
                  </div>
                  <div className={cx("comment__detail--createRight")}>
                    ·
                    <span className={cx("comment__detail--time")}>
                      {diffSeconds < 60
                        ? "vừa xong"
                        : diffMinutes < 60
                        ? `${diffMinutes} phút trước`
                        : diffHours < 24
                        ? `${diffHours} giờ trước`
                        : diffDays < 30
                        ? `${diffDays} ngày trước`
                        : diffMonths < 12
                        ? `${diffMonths} tháng trước`
                        : `${Math.floor(diffMonths / 12)} năm trước`}
                    </span>
                    <span className={cx("comment__detail--more")}>
                      ·
                      <button className={cx("comment__detail--morebtn")}>
                        <Dropdown
                          menu={{
                            items:
                              userInfo?._id === userStates.userInfo?._id
                                ? items?.filter((o) => o?.key !== "0")
                                : items?.filter((o) => o?.key === "0"),
                            onClick: ({ key }) => {
                              setCommentInfo(comment);
                              onClickDropDown({ key, id, content });
                            },
                          }}
                          trigger={["click"]}
                          placement="bottomRight"
                        >
                          <FaEllipsisH
                            className={cx("comment__detail--moreicon")}
                          />
                        </Dropdown>
                      </button>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={cx("comment")}>
        <Drawer
          className={props.className}
          placement={props.placement}
          onClose={props.onClose}
          open={props.open}
          width={props.width}
          zIndex={props.zIndex}
        >
          <div
            style={{ height: "100%", overflow: "auto" }}
            ref={drawerRef}
            onScroll={handleScroll}
          >
            <div className={cx("comment__inner")}>
              <div className={cx("comment__heading")}>
                <h4 className={cx("comment__heading--count")}>
                  {commentStates.total} Bình luận
                </h4>
                <p className={cx("comment__heading--help")}>
                  (Nếu thấy bình luận spam, các bạn bấm report giúp admin nhé)
                </p>
              </div>

              <div className={cx("comment__cmtbox")}>
                <div className={cx("comment__avt--wrapper")}>
                  {/* <AvatarIcon className={cx("comment__avt--fallback")} /> */}
                  {userStates?.userInfo?.avatar ? (
                    <Avatar
                      className={cx("comment__avt")}
                      src={userStates?.userInfo?.avatar}
                    />
                  ) : (
                    <Avatar
                      className={cx("comment__avt", "comment__avt--fallback")}
                      src={fallbackAvatar}
                    />
                  )}
                </div>
                <div className={cx("comment__content--wrapper")}>
                  <div className={cx("comment__content--placeholder")}>
                    {openComment ? (
                      <div className={cx("comment__content--tinymce")}>
                        <TinyMCEEditor
                          editorRef={content}
                          // keyMCE={`${Math.random()}`}
                          placeholder="Bạn có thắc mắc gì trong bài học này?"
                          height={300}
                          // onChange={(value: string) => {
                          //   // Nếu timeoutId đã được đặt trước đó, hủy bỏ
                          //   if (timeoutId) {
                          //     window.clearTimeout(timeoutId);
                          //   }

                          //   // Đặt timeout để gọi sau 2 giây
                          //   setTimeoutId(
                          //     window.setTimeout(() => {
                          //       // console.log(`Kết quả: ${value}`);

                          //       dataTopicActive.id &&
                          //         userStates.userInfo &&
                          //         realtime.writingComment({
                          //           idTopic: dataTopicActive.id || "",
                          //           userInfo: userStates.userInfo,
                          //         });
                          //     }, 800)
                          //   );
                          // }}
                        />
                        <div className={cx("comment__content--action")}>
                          <button
                            className={cx(
                              "comment__content--btn",
                              "cancel-btn"
                            )}
                            onClick={() => {
                              setOpenComment(false);
                            }}
                          >
                            Huỷ
                          </button>
                          <button
                            className={cx(
                              "comment__content--btn",
                              "accept-btn"
                            )}
                            onClick={handleCreateComment}
                          >
                            Bình luận
                          </button>
                        </div>
                      </div>
                    ) : (
                      <span
                        onClick={() => {
                          setOpenComment(true);
                        }}
                      >
                        Bạn có thắc mắc gì trong bài học này?
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {commentStates.comments.map((comment, key) => {
                return ItemComment(comment, key);
              })}
              <Modal
                open={isDelete}
                onOk={() => hanldeDeleteComment(commentInfo)}
                onCancel={() => setIsDelete(false)}
                mask={false}
              >
                <p>Bạn có chắc muốn xóa</p>
              </Modal>
            </div>
          </div>
        </Drawer>
      </div>
    </>
  );
};

export default memo(FCComment);
