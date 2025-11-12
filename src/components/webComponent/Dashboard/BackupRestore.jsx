import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase, faDownload, faUpload, faHistory, faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import axios from "axios";

function BackupRestore() {
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [history, setHistory] = useState([]); // Optionally fetch backup history from API

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Download backup
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BASE_URL}/backup/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "restaurant-backup.zip");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Backup downloaded successfully!");
    } catch (err) {
      toast.error("Failed to download backup");
    } finally {
      setDownloading(false);
    }
  };

  // Upload backup
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a backup file to upload.");
      return;
    }
    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("backup", selectedFile);
      await axios.post(`${BASE_URL}/backup/restore`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Backup restored successfully!");
      setSelectedFile(null);
    } catch (err) {
      toast.error("Failed to restore backup");
    } finally {
      setUploading(false);
    }
  };

  // Optionally, fetch backup history from API
  // useEffect(() => { ... }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 lg:pl-72 pl-0">
        <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-20 items-center justify-between px-6">
            <div>
              <h1 className="text-2xl font-semibold">Backup & Restore</h1>
              <p className="text-sm text-muted-foreground">
                Download a backup or restore your restaurant data
              </p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Download Backup */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faDownload} className="h-5 w-5 text-blue-600" />
                  Download Backup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Download a full backup of your restaurant data. Keep this file safe!</p>
                <Button onClick={handleDownload} disabled={downloading} className="w-full">
                  <FontAwesomeIcon icon={faDatabase} className="h-4 w-4 mr-2" />
                  {downloading ? "Downloading..." : "Download Backup"}
                </Button>
              </CardContent>
            </Card>
            {/* Restore Backup */}
            <Card className="border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faUpload} className="h-5 w-5 text-green-600" />
                  Restore Backup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpload} className="space-y-4">
                  <p className="text-muted-foreground">Upload a backup file to restore your data. This will overwrite current data.</p>
                  <Input
                    type="file"
                    accept=".zip,.json"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    disabled={uploading}
                  />
                  <Button type="submit" disabled={uploading} className="w-full">
                    <FontAwesomeIcon icon={faUpload} className="h-4 w-4 mr-2" />
                    {uploading ? "Restoring..." : "Restore Backup"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          {/* Optionally, show backup history */}
          {/* <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FontAwesomeIcon icon={faHistory} className="h-5 w-5 text-gray-600" />
                Backup History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {history.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faCheckCircle} className="h-4 w-4 text-green-600" />
                    <span>{item.date}</span>
                    <span className="text-xs text-muted-foreground">{item.status}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
}

export default BackupRestore; 