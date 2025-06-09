"use client";

import React, { useRef } from "react";
import { Toast } from "primereact/toast";
import { FileUpload } from "primereact/fileupload";
import { Button } from "primereact/button";

export default function UploadResumePage() {
  const toast = useRef(null);
  const fileUploadRef = useRef(null);

  const onUpload = () => {
    toast.current.show({
      severity: "success",
      summary: "Uploaded",
      detail: "Resume uploaded successfully!",
    });
  };

  const onRemove = (file, callback) => {
    callback();
  };

  const onSelect = (e) => {
    const allowedExtensions = ['pdf', 'PDF', 'docx', 'DOCX', 'txt', 'TXT', 'md', 'MD', 'odt', 'ODT'];

    const isValid = e.files.every((file) => {
      const ext = file.name.split('.').pop();
      return allowedExtensions.includes(ext);
    });

    if (!isValid) {
      toast.current.show({
        severity: 'error',
        summary: 'Unsupported File',
        detail: 'This file type is not supported.',
      });

      // Clear invalid file(s)
      fileUploadRef.current?.clear();
    }
  };

  const onClear = () => {
    // Optional: Add toast or logic on clear
  };

  const itemTemplate = (file, props) => (
    <div className="flex items-center justify-between p-3 border rounded-md w-full bg-white dark:bg-stone-800 mt-2">
      <div className="flex items-center gap-3">
        <i className="pi pi-file" style={{ fontSize: "1.5rem" }}></i>
        <div className="flex flex-col">
          <span className="font-medium text-gray-800 dark:text-gray-100 truncate max-w-xs">
            {file.name}
          </span>
          <small className="text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString()}
          </small>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          icon="pi pi-upload"
          className="p-button-sm p-button-success p-button-text"
          onClick={() => props.onUpload?.()}
        />
        <Button
          icon="pi pi-times"
          className="p-button-sm p-button-danger p-button-text"
          onClick={() => onRemove(file, props.onRemove)}
        />
      </div>
    </div>
  );

  const emptyTemplate = () => (
    <div className="flex flex-col items-center text-gray-500 dark:text-gray-400 py-10">
      <i className="pi pi-upload text-5xl mb-4" />
      <span>Drag and drop your resume here</span>
    </div>
  );

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <FileUpload
        ref={fileUploadRef}
        name="file"
        url="/api/upload"
        accept=".pdf,.PDF,.docx,.DOCX,.txt,.md,.odt,.TXT,.MD,.ODT"
        customUpload
        auto
        onUpload={onUpload}
        onSelect={onSelect}
        onError={onClear}
        onClear={onClear}
        itemTemplate={itemTemplate}
        emptyTemplate={emptyTemplate}
      />
    </div>
  );
}
