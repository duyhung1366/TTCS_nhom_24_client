import { ApiConfig } from "./config";
import EndPoint from "../submodule/common/endpoint";
import { Comment } from "../submodule/models/comment";

export const apiUpdateComment = async (payload: Comment) => {
  return ApiConfig(EndPoint.UPDATE_COMMENT, { payload });
};

export const apiLoadComments = async (params: {
  idTopic: string;
  limit?: number;
  skip?: number;
}) => {
  return ApiConfig(EndPoint.GET_COMMENT, { params });
};

export const apiSendReactionComment = async (payload: {
  idComment: string;
  idUser: string;
  type: number;
}) => {
  return ApiConfig(EndPoint.SEND_REACTION_COMMENT, { payload });
};

export const apiDeleteComment = async (payload: {
  idComment: string;
  idTopic: string;
}) => {
  return ApiConfig(EndPoint.DELETE_COMMENT, { payload });
};
