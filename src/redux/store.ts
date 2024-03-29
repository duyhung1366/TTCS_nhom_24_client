import { configureStore, Action } from "@reduxjs/toolkit";
import authReducer from "./slices/userSlice";
import categoryReducer from "./slices/categorySlice";
import courseReducer from "./slices/courseSlice";
import topicReducer from "./slices/topicSlice";
import questionReducer from "./slices/questionSlice";
import commentReducer from "./slices/commentSlice";

export const store = configureStore({
  reducer: {
    authState: authReducer,
    category: categoryReducer,
    course: courseReducer,
    topic: topicReducer,
    question: questionReducer,
    comment: commentReducer,
  },
  middleware: (getDefaultMiddle) =>
    getDefaultMiddle({ serializableCheck: false }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
