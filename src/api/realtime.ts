import io from "socket.io-client";
import {
  deleteCommentSoket,
  updateCommentSocket,
} from "../redux/slices/commentSlice";
import { Comment } from "../submodule/models/comment";
import { UserInfo } from "../submodule/models/user";

const REACT_APP_ENDPOINT =
  process.env.REACT_APP_ENDPOINT || "http://localhost:3001";

export class SocketService {
  private socket: any;
  public init = () => {
    this.socket = io(REACT_APP_ENDPOINT, {
      path: "/api/socketio/",
      transports: ["websocket"],
      reconnection: true,
      timeout: 1000,
      reconnectionDelay: 3000,
      reconnectionDelayMax: 30000,
    });

    this.socket.on("connect", () => {
      console.log("connecttion socket successfully");
    });

    this.socket.on("connect_error", (err: any) => {
      console.log(`connecttion socket error` + err);
    });

    return this;
  };

  joinSocket = (props: { userInfo: UserInfo | null }) => {
    // console.log({ props, socket: this.socket });
    this.socket.emit("join_socket", props).on("join_socket", (msg: string) => {
      // console.log(msg);
    });
  };

  joinComment = (props: { idTopic: string; userInfo: UserInfo }) => {
    this.socket
      .emit("join_room_comment", props)
      .on("join_room_comment", (msg: string) => {
        // console.log(msg);
      });
  };

  loadComment = (dispatch: any) => {
    this.socket.on("send-comment", (data: { comment: Comment }) => {
      dispatch(updateCommentSocket(data.comment));
    });
  };

  updateComment = (dispatch: any) => {
    // console.log('hello');

    this.socket.on("update-comment", (data: { comment: Comment }) => {
      dispatch(updateCommentSocket(data.comment));
    });
  };

  deleteComment = (dispatch: any) => {
    // console.log('hello');

    this.socket.on(
      "delete-comment",
      (data: { id: string; idTopic: string }) => {
        dispatch(deleteCommentSoket(data));
      }
    );
  };

  leaveComment = (props: { idTopic: string; userInfo: UserInfo }) => {
    this.socket
      .emit("leave_room_comment", props)
      .on("leave_room_comment", (msg: string) => {
        // console.log(msg);
      });
  };

  writingComment = (props: { idTopic: string; userInfo: UserInfo | null }) => {
    // console.log({ props, socket: this.socket });
    this.socket
      .emit("writing_comment", props)
      .on("writing_comment", (msg: UserInfo) => {
        // console.log(msg);
      });
  };
}
