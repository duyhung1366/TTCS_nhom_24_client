import React, { useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Editor as EditorType } from "tinymce";
import { Button } from "antd";
import { apiUploadFile } from "../../api/upload";
import { ENDPOINT_LOCAL, PREFIX_API } from "../../api/config";
import ENDPONTAPI from "../../submodule/common/endpoint";

const TinyMCEEditor = (props: {
  editorRef: any;
  keyMCE?: string;
  placeholder?: string;
  height?: number;
  value?: string;
  onChange?: (value: string) => void;
}) => {
  const {
    editorRef,
    keyMCE = "",
    placeholder = "",
    height = 500,
    onChange,
    value,
  } = props;

  const handleImageUpload: any = async (
    blobInfo: any,
    success: any,
    failure: any
  ) => {
    // const formData = new FormData();
    // formData.append("image", blobInfo.blob(), blobInfo.filename());
    try {
      const res = await apiUploadFile(blobInfo.blob(), blobInfo.filename());
      success(res.data);
    } catch (error) {
      console.error(error);
      failure();
    }
  };
  return (
    <>
      <Editor
        ref={editorRef}
        key={keyMCE}
        apiKey="x7iqyfri0yduoqx0qrv9r5h50yq6gj7bybcu12uc2x2a9qkl"
        // onChange={(_, editor) => {onChange}}
        onEditorChange={(value, editor) => {
          onChange && onChange(value);
        }}
        initialValue={value}
        init={{
          height: height,
          menubar: true,
          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "help",
            "wordcount",
          ],
          toolbar:
            "undo redo | blocks | " +
            "bold italic backcolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | help",
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:16px }",
          images_upload_handler: handleImageUpload,
          placeholder: placeholder,
          // images_upload_url: `${ENDPOINT_LOCAL}/${PREFIX_API}${ENDPONTAPI.UPLOAD}`,
          automatic_uploads: true,
          images_file_types: "jpg,svg,png",
          file_picker_types: "image",
        }}
        onInit={(evt, editor) => {
          editorRef.current = editor;
        }}
      />
    </>
  );
};

export default TinyMCEEditor;
