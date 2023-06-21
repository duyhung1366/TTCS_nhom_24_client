import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  apiLoadComments,
  apiSendReactionComment,
  apiUpdateComment,
} from "../../api/comment";
import TTCSconfig from "../../submodule/common/config";
import { Comment } from "../../submodule/models/comment";
import { RootState } from "../store";

interface CommentState {
  comments: Comment[];
  loading: boolean;
  loadingUpdate: boolean;
  commentInfo: Comment | null;
  total: number;
}

const initialState: CommentState = {
  comments: [],
  loading: false,
  loadingUpdate: false,
  commentInfo: null,
  total: 0,
};

export const requestUpdateComment = createAsyncThunk(
  "comment/updateComment",
  async (props: Comment) => {
    const res = await apiUpdateComment(props);
    return res.data;
  }
);

export const requestSendReactionComment = createAsyncThunk(
  "comment/requestSendReactionComment",
  async (props: { idComment: string; idUser: string; type: number }) => {
    const res = await apiSendReactionComment(props);
    return res.data;
  }
);

export const requestLoadComments = createAsyncThunk(
  "comment/requestLoadComments",
  async (props: { idTopic: string; limit?: number; skip?: number }) => {
    const res = await apiLoadComments(props);
    return res.data;
  }
);

export const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    updateCommentSocket: (state, action: PayloadAction<Comment>) => {
      const data = action.payload;
      const comments = [...state.comments];
      const indexData = comments.findIndex((comment) => comment.id === data.id);
      if (indexData !== -1) {
        // update
        comments.splice(indexData, 1, data);
        state.comments = comments;
      } else {
        // create
        state.comments = [data, ...comments];
        state.total++;
      }
    },
    deleteCommentSoket: (
      state,
      action: PayloadAction<{ id: string; idTopic: string }>
    ) => {
      const comments = [...state.comments];
      state.comments = comments.filter(
        (comment) => comment.id !== action.payload.id
      );
    },

    setComments: (state, action) => {
      const data = action.payload;
      state.comments = [...state.comments, ...data];
    },
  },
  extraReducers: (builder) => {
    // load
    builder.addCase(requestLoadComments.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(requestLoadComments.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(
      requestLoadComments.fulfilled,
      (
        state,
        action: PayloadAction<{
          data: Comment[];
          total: number;
          status: number;
        }>
      ) => {
        state.loading = false;
        state.comments = action.payload.data;
        state.total = action.payload.total;
      }
    );

    // update
    builder.addCase(requestUpdateComment.pending, (state) => {
      state.loadingUpdate = true;
    });
    builder.addCase(requestUpdateComment.rejected, (state) => {
      state.loadingUpdate = false;
    });

    builder.addCase(
      requestUpdateComment.fulfilled,
      (
        state,
        action: PayloadAction<{
          data: Comment;
          status: number;
        }>
      ) => {
        state.loadingUpdate = false;
      }
    );

    // update
    builder.addCase(requestSendReactionComment.pending, (state) => {
      state.loadingUpdate = true;
    });
    builder.addCase(requestSendReactionComment.rejected, (state) => {
      state.loadingUpdate = false;
    });
    builder.addCase(requestSendReactionComment.fulfilled, (state) => {
      state.loadingUpdate = false;
    });
  },
});

export const { updateCommentSocket, setComments, deleteCommentSoket } =
  commentSlice.actions;

export const commentState = (state: RootState) => state.comment;

export default commentSlice.reducer;
