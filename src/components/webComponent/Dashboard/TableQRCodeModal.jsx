import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import QRCode from "qrcode";
import { Download, RefreshCw } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const TableQRCodeModal = ({ isOpen, onClose, table }) => {
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [displayUrl, setDisplayUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const fixQrData = (url) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === "localhost" || urlObj.hostname === "127.0.0.1") {
        const currentUrl = new URL(window.location.href);
        urlObj.protocol = currentUrl.protocol;
        urlObj.host = currentUrl.host;
        return urlObj.toString();
      }
      return url;
    } catch (e) {
      return url;
    }
  };

  useEffect(() => {
    if (isOpen && table?.qrCodeData) {
      const fixedUrl = fixQrData(table.qrCodeData);
      setDisplayUrl(fixedUrl);
      generateQRImage(fixedUrl);
    }
  }, [isOpen, table]);

  const generateQRImage = async (qrData) => {
    try {
      setLoading(true);
      const qrImage = await QRCode.toDataURL(qrData, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrImageUrl(qrImage);
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code");
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = () => {
    const link = document.createElement("a");
    link.href = qrImageUrl;
    link.download = `table-${table.tableId}-qr.png`;
    link.click();
    toast.success("QR Code downloaded");
  };

  const regenerateQR = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${BASE_URL}/home/regenerate-qr/${table._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const fixedUrl = fixQrData(response.data.qrCodeData);
      setDisplayUrl(fixedUrl);
      await generateQRImage(fixedUrl);
      toast.success("QR Code regenerated successfully");
    } catch (error) {
      console.error("Error regenerating QR:", error);
      toast.error("Failed to regenerate QR code");
    } finally {
      setLoading(false);
    }
  };

  const printQRCode = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Table ${table.tableId} - QR Code</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            h1 {
              margin-bottom: 20px;
            }
            img {
              max-width: 400px;
              border: 2px solid #000;
              padding: 20px;
            }
            @media print {
              @page {
                margin: 20mm;
              }
            }
          </style>
        </head>
        <body>
          <h1>Table ${table.tableId}</h1>
          <img src="${qrImageUrl}" alt="QR Code" />
          <p>Scan to order</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (!table) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Table {table.tableId} - QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
                {qrImageUrl && (
                  <img
                    src={qrImageUrl}
                    alt="Table QR Code"
                    className="w-full h-auto"
                  />
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Section:</strong> {table.tableSectionId?.tableSection || "N/A"}
                </p>
                <p className="text-xs text-gray-500 break-all">
                  <strong>QR URL:</strong> {displayUrl || table.qrCodeData}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={downloadQRCode}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download size={16} className="mr-2" />
                  Download
                </Button>
                <Button onClick={printQRCode} variant="outline">
                  Print
                </Button>
                <Button
                  onClick={regenerateQR}
                  variant="outline"
                  className="col-span-2"
                  disabled={loading}
                >
                  <RefreshCw size={16} className="mr-2" />
                  Regenerate QR Code
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TableQRCodeModal;
