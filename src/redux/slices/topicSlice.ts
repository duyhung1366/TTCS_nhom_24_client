import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../redux/store";
import { Course } from "../../submodule/models/course";
import { apiLoadCourseBySlug } from "../../api/course";
import { Topic } from "../../submodule/models/topic";
import {
  apiLoadTopicByCourse,
  apiLoadTopicById,
  apiUpdateTopic,
} from "../../api/topic";

// Define a type for the slice state
interface TopicState {
  loading: boolean;
  error: string;
  topics: Topic[];
  topicInfo: Topic | null;
  total: number;
  totalLearned: number;
}

// Define the initial state using that type
const initialState: TopicState = {
  loading: false,
  error: "",
  topics: [],
  topicInfo: null,
  total: 0,
  totalLearned: 0,
};

export const requestLoadTopicByCourse = createAsyncThunk(
  "topic/requestLoadTopicByCourse",
  async (props: { idCourse: string; type: number; parentId?: string }) => {
    const res = await apiLoadTopicByCourse(props);
    return res.data;
  }
);

export const requestLoadTopicById = createAsyncThunk(
  "topic/requestLoadTopicById",
  async (props: { id: string }) => {
    const res = await apiLoadTopicById(props);
    return res.data;
  }
);

export const requestUpdateTopicById = createAsyncThunk(
  "topic/requestUpdateTopicById",
  async (props: Topic) => {
    const res = await apiUpdateTopic(props);
    return res.data;
  }
);

export const topicSlice = createSlice({
  name: "topic",
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    const actionList = [
      requestLoadTopicByCourse,
      requestLoadTopicById,
      requestUpdateTopicById,
    ];
    actionList.forEach((action) => {
      builder.addCase(action.pending, (state) => {
        state.loading = true;
      });
    });
    actionList.forEach((action) => {
      builder.addCase(action.rejected, (state) => {
        state.loading = false;
      });
    });

    // load topic by id Course
    builder.addCase(
      requestLoadTopicByCourse.fulfilled,
      (
        state,
        action: PayloadAction<{
          data: Topic[];
          total: number;
          totalLearned: number;
        }>
      ) => {
        state.topics = action.payload.data;
        state.total = action.payload.total;
        state.totalLearned = action.payload.totalLearned;
        state.loading = false;
      }
    );

    // load topic by id
    builder.addCase(
      requestLoadTopicById.fulfilled,
      (state, action: PayloadAction<Topic>) => {
        state.topicInfo = action.payload;
        state.loading = false;
      }
    );

    builder.addCase(
      requestUpdateTopicById.fulfilled,
      (
        state,
        action: PayloadAction<{
          data: Topic;
          status: number;
        }>
      ) => {
        console.log(action.payload);

        state.loading = false;
        state.topicInfo = action.payload.data;
      }
    );
  },
});

export const {} = topicSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const topicState = (state: RootState) => state.topic;

export default topicSlice.reducer;
