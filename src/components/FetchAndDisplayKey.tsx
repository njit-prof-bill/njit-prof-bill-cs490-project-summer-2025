import { useEffect, useState } from "react";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import WorkExperienceEditor from "../components/WorkExperienceEditor";
import EducationEditor from "../components/EducationEditor";
import { isValidEmail, isValidPhoneNumber } from "@/utils/validators";
import { formatPhoneNumber } from "@/utils/formatters";

interface Job {
  company: string;
  role: string;
  jobDesc: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

// Map Firestore structure → editor structure
const normalizeWorkExperience = (data: any[]): Job[] =>
  data.map((job) => ({
    company: job.company || "",
    role: job.jobTitle || "",
    jobDesc: job.jobDesc || "",
    startDate: job.startDate || "",
    endDate: job.endDate || "",
    description: Array.isArray(job.responsibilities)
      ? job.responsibilities.join("\n")
      : "",
  }));

// Map editor structure → Firestore structure
const denormalizeWorkExperience = (data: Job[]): any[] =>
  data.map((job) => ({
    company: job.company,
    jobTitle: job.role,
    jobDesc: job.jobDesc,
    startDate: job.startDate,
    endDate: job.endDate,
    responsibilities: job.description
      ? job.description
          .split("\n")
          .map((r) => r.trim())
          .filter(Boolean)
      : [],
  }));

const normalizeEducation = (data: any[]): EducationItem[] =>
  data
    .filter((edu) => edu && typeof edu === "object")
    .map((edu) => ({
      institution: edu.institution || "",
      degree: edu.degree || "",
      startDate: edu.startDate || "",
      endDate: edu.endDate || "",
      gpa: edu.gpa || "",
    }));

const denormalizeEducation = (data: EducationItem[]): any[] =>
  data.map((edu) => ({
    institution: edu.institution,
    degree: edu.degree,
    startDate: edu.startDate,
    endDate: edu.endDate,
    gpa: edu.gpa || "",
  }));

interface Props {
  keyPath: string;
}

const FetchAndDisplayKey: React.FC<Props> = ({ keyPath }) => {
  const [value, setValue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState<any>(null);
  const [adding, setAdding] = useState(false);
  const [newItem, setNewItem] = useState<string>("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [tempLabels, setTempLabels] = useState<Record<string, string>>({});

  const auth = getAuth();
  const firestore = getFirestore();

  const getNestedValue = (obj: any, path: string): any =>
    path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);

  const setNestedValue = (obj: any, path: string, value: any): any => {
    const keys = path.split(".");
    const result = JSON.parse(JSON.stringify(obj));
    let current = result;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== "object") {
        current[key] = {};
      }
      current = current[key];
    }
    const lastKey = keys[keys.length - 1];
    if (value === null || value === undefined) {
      delete current[lastKey];
    } else {
      current[lastKey] = value;
    }
    return result;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        const docRef = doc(
          firestore,
          `/users/${uid}/userDocuments/categoryData`
        );
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
          setError("Document does not exist");
          setLoading(false);
          return;
        }

        const data = docSnap.data();
        const jsonString: string = data.groqResponse;
        let jsonObject;
        try {
          jsonObject = JSON.parse(jsonString);
        } catch (err) {
          setError("Invalid JSON string");
          setLoading(false);
          return;
        }

        const nestedValue = getNestedValue(jsonObject, keyPath);
        if (nestedValue !== undefined) {
          setValue(nestedValue);
        } else {
          setError(`Key path "${keyPath}" not found`);
        }
      } catch (err) {
        console.error(err);
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [keyPath, auth, firestore]);

  const saveData = async () => {
    try {
      if (keyPath === "contact.email") {
        for (const val of Object.values(editValue || {})) {
          if (typeof val === "string" && !isValidEmail(val)) {
            setError("Invalid email in contact.email");
            return;
          }
        }
      }
      if (keyPath === "contact.phone") {
        for (const val of Object.values(editValue || {})) {
          if (typeof val === "string" && !isValidPhoneNumber(val)) {
            setError("Invalid phone number in contact.phone");
            return;
          }
        }
      }

      setSaving(true);
      const uid = auth.currentUser?.uid;
      if (!uid || editValue === null) return;

      const docRef = doc(firestore, `/users/${uid}/userDocuments/categoryData`);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        setError("Document does not exist");
        return;
      }
      const data = docSnap.data();
      const jsonString: string = data.groqResponse;
      let jsonObject;

      try {
        jsonObject = JSON.parse(jsonString);
      } catch (err) {
        setError("Invalid JSON string in document");
        return;
      }

      const updatedJsonObject = setNestedValue(jsonObject, keyPath, editValue);
      const updatedJsonString = JSON.stringify(updatedJsonObject);
      await updateDoc(docRef, { groqResponse: updatedJsonString });
      setValue(editValue);
      setEditMode(false);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error("Save failed", err);
      setError("Failed to save data");
    } finally {
      setSaving(false);
    }
  };

  const deleteSection = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;
      const docRef = doc(firestore, `/users/${uid}/userDocuments/categoryData`);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        setError("Document does not exist");
        return;
      }
      const data = docSnap.data();
      const jsonString: string = data.groqResponse;
      let jsonObject;
      try {
        jsonObject = JSON.parse(jsonString);
      } catch (err) {
        setError("Invalid JSON string in document");
        return;
      }
      const updatedJsonObject = setNestedValue(jsonObject, keyPath, undefined);
      const updatedJsonString = JSON.stringify(updatedJsonObject);
      await updateDoc(docRef, { groqResponse: updatedJsonString });
      setValue(null);
    } catch (err) {
      console.error("Delete failed", err);
      setError("Failed to delete");
    }
  };

  const startEditing = () => {
    setEditMode(true);
    setEditValue(value);
    setHasUnsavedChanges(false);

    if (
      (keyPath === "contact.email" || keyPath === "contact.phone") &&
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      const labels = Object.keys(value);
      setTempLabels(Object.fromEntries(labels.map((label) => [label, label])));
    }
  };

  const handleEditValueChange = (newValue: any) => {
    setEditValue(newValue);
    setHasUnsavedChanges(JSON.stringify(newValue) !== JSON.stringify(value));
  };

  const cancelEditing = () => {
    setEditMode(false);
    setEditValue(null);
    setHasUnsavedChanges(false);
    setTempLabels({});
  };

  const addItem = async () => {
    if (!newItem.trim()) return;

    if (keyPath === "contact.email" && !isValidEmail(newItem.trim())) {
      setInputError("Please enter a valid email address");
      return;
    }
    if (keyPath === "contact.phone" && !isValidPhoneNumber(newItem.trim())) {
      setInputError("Please enter a valid phone number");
      return;
    }

    setInputError(null);

    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      let updatedValue;

      if (Array.isArray(value)) {
        updatedValue = [...value, newItem];
      } else if (typeof value === "object" && value !== null) {
        const key = prompt("Enter a label (e.g. work, personal, backup):");
        if (!key || key.trim() === "") return;
        updatedValue = { ...value, [key.trim()]: newItem };
      } else if (typeof value === "string") {
        const key = prompt("Enter a label (e.g. work, personal, backup):");
        if (!key || key.trim() === "") return;
        updatedValue = { primary: value, [key.trim()]: newItem };
      } else {
        updatedValue = [newItem];
      }

      const docRef = doc(firestore, `/users/${uid}/userDocuments/categoryData`);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error("Document not found");

      const data = docSnap.data();
      const jsonObject = JSON.parse(data.groqResponse);
      const updatedJsonObject = setNestedValue(
        jsonObject,
        keyPath,
        updatedValue
      );
      const updatedJsonString = JSON.stringify(updatedJsonObject);

      await updateDoc(docRef, { groqResponse: updatedJsonString });

      setValue(updatedValue);
      setAdding(false);
      setNewItem("");
    } catch (err) {
      console.error("Add item failed", err);
      setError("Failed to add item");
    }
  };

  const removeItem = async (keyOrIndex: string | number) => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      let updatedValue;

      if (Array.isArray(value)) {
        updatedValue = value.filter((_, i) => i !== keyOrIndex);
      } else if (typeof value === "object" && value !== null) {
        updatedValue = { ...value };
        delete updatedValue[keyOrIndex];
      } else {
        return;
      }

      const docRef = doc(firestore, `/users/${uid}/userDocuments/categoryData`);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) throw new Error("Document not found");

      const data = docSnap.data();
      const jsonObject = JSON.parse(data.groqResponse);
      const updatedJsonObject = setNestedValue(
        jsonObject,
        keyPath,
        updatedValue
      );
      const updatedJsonString = JSON.stringify(updatedJsonObject);

      await updateDoc(docRef, { groqResponse: updatedJsonString });

      setValue(updatedValue);
    } catch (err) {
      console.error("Remove item failed", err);
      setError("Failed to remove item");
    }
  };

  const renderNested = (val: any) => {
    if (keyPath === "contact.email" || keyPath === "contact.phone") {
      if (typeof val === "string") {
        return (
          <div>
            <div>• Primary: {val}</div>
          </div>
        );
      }

      if (typeof val === "object" && val !== null) {
        return (
          <div>
            {Object.entries(val).map(([label, addrOrPhone]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "0.25rem",
                }}
              >
                <span style={{ flex: 1 }}>
                  • {label[0].toUpperCase() + label.slice(1)}:{" "}
                  {keyPath === "contact.phone" &&
                  typeof addrOrPhone === "string"
                    ? formatPhoneNumber(addrOrPhone)
                    : String(addrOrPhone)}
                </span>

                {/* <button
                  onClick={() => removeItem(label)}
                  style={{
                    marginLeft: '0.5rem',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button> */}
              </div>
            ))}
          </div>
        );
      }
    }
    if (Array.isArray(val)) {
      return (
        <div
          style={{
            border: "1px solid #ccc",
            padding: "0.5rem",
            marginBottom: "1rem",
            maxWidth: "100%",
            overflow: "auto",
          }}
        >
          <ul style={{ margin: 0, paddingLeft: "1.5rem" }}>
            {val.map((item, index) => (
              <li key={index} style={{ marginBottom: "0.25rem" }}>
                {renderNested(item)}
              </li>
            ))}
          </ul>
        </div>
      );
    } else if (typeof val === "object" && val !== null) {
      return (
        <pre
          style={{
            padding: "0.5rem",
            margin: 0,
            maxWidth: "100%",
            overflow: "auto",
            backgroundColor: "",
            border: "1px solid #e9ecef",
            borderRadius: "4px",
            fontSize: "0.875rem",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {JSON.stringify(val, null, 2)}
        </pre>
      );
    } else if (typeof val === "string") {
      return <span style={{ wordBreak: "break-word" }}>{val}</span>;
    } else {
      return <span style={{ wordBreak: "break-word" }}>{String(val)}</span>;
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error && value === null) {
    return null;
  } else if (error) return <p>Error: {error}</p>;

  // Main render
  return (
    <div
      style={{
        border: "1px solid #000",
        padding: "1rem",
        marginBottom: "1rem",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "0.5rem",
          flexWrap: "wrap",
          gap: "0.5rem",
        }}
      >
        {/* <h3
          style={{
            margin: 0,
            fontSize: "1.1rem",
            wordBreak: "break-word",
            minWidth: 0,
            flex: "1 1 auto",
          }}
        >
          {keyPath}
        </h3> */}
        {hasUnsavedChanges && (
          <span
            style={{
              backgroundColor: "#fff3cd",
              color: "#856404",
              padding: "0.25rem 0.5rem",
              borderRadius: "4px",
              fontSize: "0.875rem",
              border: "1px solid #ffeaa7",
              whiteSpace: "nowrap",
            }}
          >
            ● Unsaved changes
          </span>
        )}
        {saving && (
          <span
            style={{
              backgroundColor: "#d4edda",
              color: "#155724",
              padding: "0.25rem 0.5rem",
              borderRadius: "4px",
              fontSize: "0.875rem",
              border: "1px solid #c3e6cb",
              whiteSpace: "nowrap",
            }}
          >
            Saving...
          </span>
        )}
      </div>

      {editMode ? (
        <div style={{ width: "100%" }}>
          {/* For 'workExperience' and 'education', editing features are removed */}
          {keyPath === "workExperience" ? (
            <WorkExperienceEditor
              workExperience={
                Array.isArray(editValue)
                  ? normalizeWorkExperience(editValue)
                  : []
              }
              onChange={(updated) =>
                handleEditValueChange(denormalizeWorkExperience(updated))
              }
            />
          ) : keyPath === "education" ? (
            <EducationEditor
              education={
                Array.isArray(editValue)
                  ? normalizeEducation(editValue)
                  : [normalizeEducation([editValue])[0]]
              }
              onChange={(updated) => {
                const denorm = denormalizeEducation(updated);
                handleEditValueChange(
                  Array.isArray(editValue) ? denorm : denorm[0]
                );
              }}
            />
          ) : keyPath === "contact.email" || keyPath === "contact.phone" ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              {(() => {
                if (typeof editValue === "string") {
                  // Convert string into editable object format
                  const converted = { primary: editValue };
                  handleEditValueChange(converted);
                  return null; // let component re-render with new object
                }

                if (
                  typeof editValue !== "object" ||
                  editValue === null ||
                  Array.isArray(editValue)
                ) {
                  return (
                    <p>
                      Invalid format: expected an object with string values.
                    </p>
                  );
                }

                const entries = Object.entries(editValue).filter(
                  ([_, val]) => typeof val === "string"
                ) as [string, string][];

                return entries.map(([label, val], idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="text"
                      value={tempLabels[label] ?? label}
                      style={{ flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
                      onChange={(e) => {
                        const newLabel = e.target.value.trim();

                        // Track typing state for UI
                        setTempLabels((prev) => ({
                          ...prev,
                          [label]: newLabel,
                        }));

                        // Don't update unless it's a legit label and changed
                        if (!newLabel || newLabel === label) return;

                        if (editValue[newLabel] !== undefined) {
                          // Handle collision
                          return;
                        }

                        // Apply label rename to editValue
                        const updated = { ...editValue };
                        updated[newLabel] = updated[label];
                        delete updated[label];

                        handleEditValueChange(updated); // ✅ Will trigger hasUnsavedChanges

                        // Update tempLabels to reflect new label
                        setTempLabels((prev) => {
                          const { [label]: _, ...rest } = prev;
                          return { ...rest, [newLabel]: newLabel };
                        });
                      }}
                    />

                    <input
                      type="text"
                      value={val}
                      onChange={(e) => {
                        const updated = {
                          ...editValue,
                          [label]: e.target.value,
                        };
                        handleEditValueChange(updated);
                      }}
                      style={{
                        flex: 3,
                        padding: "0.5rem",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                      }}
                    />
                    <button
                      onClick={() => {
                        const updated = { ...editValue };
                        delete updated[label];
                        handleEditValueChange(updated);
                      }}
                      style={{
                        background: "#dc3545",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        padding: "0.25rem 0.5rem",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ));
              })()}

              {/* Add new label/value */}
              <div
                style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
              >
                <input
                  type="text"
                  placeholder="Label (e.g. personal)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
                <input
                  type="text"
                  placeholder="Value (e.g. someone@email.com)"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  style={{
                    flex: 3,
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                  }}
                />
                <button
                  onClick={() => {
                    if (!newLabel.trim() || !newItem.trim()) return;
                    const updated = {
                      ...editValue,
                      [newLabel.trim()]: newItem.trim(),
                    };
                    handleEditValueChange(updated);
                    setNewLabel("");
                    setNewItem("");
                  }}
                  style={{
                    background: "#28a745",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    padding: "0.5rem",
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          ) : // For other keys, show textarea for JSON or string
          typeof editValue === "string" ? (
            <textarea
              rows={4}
              style={{
                width: "100%",
                marginBottom: "0.5rem",
                boxSizing: "border-box",
                resize: "vertical",
                fontFamily: "monospace",
              }}
              value={editValue}
              onChange={(e) => handleEditValueChange(e.target.value)}
            />
          ) : (
            <textarea
              rows={10}
              style={{
                width: "100%",
                marginBottom: "0.5rem",
                boxSizing: "border-box",
                resize: "vertical",
                fontFamily: "monospace",
                fontSize: "0.875rem",
              }}
              value={JSON.stringify(editValue, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleEditValueChange(parsed);
                } catch {
                  // ignore parse errors
                }
              }}
            />
          )}

          {/* Save / Cancel buttons */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              onClick={saveData}
              disabled={saving || !hasUnsavedChanges}
              style={{
                backgroundColor: hasUnsavedChanges ? "#007bff" : "#skyblue",
                color: "white",
                opacity: saving || !hasUnsavedChanges ? 0.6 : 1,
                cursor:
                  saving || !hasUnsavedChanges ? "not-allowed" : "pointer",
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "4px",
              }}
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={cancelEditing}
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                backgroundColor: "red",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        // Display mode
        <div style={{ width: "100%" }}>
          <div
            style={{
              marginBottom: "1rem",
              maxWidth: "100%",
              overflow: "hidden",
            }}
          >
            {keyPath === "workExperience" && Array.isArray(value) ? (
              <div>
                {value.map((job: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "1rem",
                      padding: "0.75rem",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  >
                    {/*  */}
                    <div>
                      <strong>{job.jobTitle}</strong> at{" "}
                      <strong>{job.company}</strong>
                    </div>
                    <div>
                      {job.startDate} — {job.endDate}
                    </div>
                    <div>{job.jobDesc}</div>
                    {Array.isArray(job.responsibilities) && (
                      <ul
                        style={{ marginTop: "0.5rem", paddingLeft: "1.25rem" }}
                      >
                        {job.responsibilities.map((resp: string, i: number) => (
                          <li key={i}>{resp}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : keyPath === "education" ? (
              // For 'education', editing features are disabled, so just display data
              Array.isArray(value) && value.length > 0 ? (
                value.map((edu, i) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: "1rem",
                      padding: "0.75rem",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  >
                    <div>
                      <strong>{edu.institution}</strong>
                    </div>
                    <div>{edu.degree}</div>
                    <div>
                      {edu.startDate} — {edu.endDate}
                    </div>
                    {edu.gpa && <div>GPA: {edu.gpa}</div>}
                  </div>
                ))
              ) : (
                <p>No education data available.</p>
              )
            ) : keyPath === "contact.email" || keyPath === "contact.phone" ? (
              value ? (
                renderNested(value)
              ) : (
                <p>No data available.</p>
              )
            ) : value ? (
              renderNested(value)
            ) : (
              <p>No data available.</p>
            )}
          </div>

          {/* Buttons for edit, delete, add item */}
          {!(keyPath === "education" || keyPath === "skills") && (
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                flexWrap: "wrap",
                marginBottom: "1rem",
              }}
            >
              <button
                onClick={startEditing}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Edit
              </button>
              <button
                onClick={deleteSection}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
              <button
                onClick={() => setAdding(true)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Add Item
              </button>
            </div>
          )}

          {/* Add New Item */}
          {adding && (
            <div
              style={{
                marginTop: "1rem",
                padding: "1rem",
                border: "1px solid #dee2e6",
                borderRadius: "4px",
              }}
            >
              {typeof value === "string" ? (
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  style={{
                    width: "100%",
                    marginBottom: "0.5rem",
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    boxSizing: "border-box",
                  }}
                />
              ) : (
                <input
                  type="text"
                  placeholder="Enter new item"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  style={{
                    width: "100%",
                    marginBottom: "0.5rem",
                    padding: "0.5rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    boxSizing: "border-box",
                  }}
                />
              )}
              {inputError && (
                <div
                  style={{
                    color: "red",
                    marginBottom: "0.5rem",
                    fontSize: "0.875rem",
                  }}
                >
                  {inputError}
                </div>
              )}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <button
                  onClick={addItem}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setAdding(false);
                    setNewItem("");
                  }}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FetchAndDisplayKey;
