"use client";

import { useEffect, useState, Fragment } from "react";
import { 
  Search, FileText, CheckCircle2, XCircle, Clock, 
  CreditCard, UploadCloud, FileCheck, Loader2, AlertCircle, Download 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function DatinDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  // Action states
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [billingCode, setBillingCode] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [penanggungJawab, setPenanggungJawab] = useState("Carolina Meylita Sibarani, S.Tr.");
  const [dataDocument, setDataDocument] = useState<File | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/data-requests");
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: number, actionName: string, body: any) => {
    setProcessingId(id);
    try {
      // If uploading file (for DATA_UPLOADED)
      if (actionName === "UPLOAD_DATA" && dataDocument) {
        const formData = new FormData();
        formData.append("file", dataDocument);
        formData.append("folder", "documents");
        const upRes = await fetch("/api/upload", { method: "POST", body: formData });
        if (!upRes.ok) throw new Error("Upload failed");
        const { url } = await upRes.json();
        body.dataDocumentUrl = url;
      }

      const res = await fetch(`/api/data-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionName, ...body }),
      });

      if (res.ok) {
        fetchRequests();
        setExpandedId(null);
        // Reset states
        setBillingCode("");
        setRejectionReason("");
        setAdminNotes("");
        setPenanggungJawab("Carolina Meylita Sibarani, S.Tr.");
        setDataDocument(null);
      } else {
        const err = await res.json();
        alert(err.message || "Action failed");
      }
    } catch (error) {
      console.error(error);
      alert("Error processing request");
    } finally {
      setProcessingId(null);
    }
  };

  const filtered = requests.filter(req => {
    const matchSearch = 
      req.fullName.toLowerCase().includes(search.toLowerCase()) || 
      req.email.toLowerCase().includes(search.toLowerCase()) ||
      req.id.toString().includes(search);
    
    if (filterStatus === "ALL") return matchSearch;
    return matchSearch && req.status === filterStatus;
  });

  if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Permohonan Data</h1>
          <p className="text-gray-500 text-sm">Kelola permintaan data informasi dan nol rupiah</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => window.open('/api/skm/responses?format=csv', '_blank')}
          className="gap-2 border-emerald-200 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800"
        >
          <Download className="h-4 w-4" />
          Download Laporan SKM
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Cari ID, Nama, Email..." 
            className="pl-10" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="border rounded-md px-3 text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">Semua Status</option>
          <option value="SUBMITTED">Perlu Review</option>
          <option value="PAYMENT_UPLOADED">Perlu Verifikasi Bayar</option>
          <option value="PAYMENT_CONFIRMED">Perlu Upload Data</option>
          <option value="COMPLETED">Selesai</option>
        </select>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b text-gray-500 font-medium">
            <tr>
              <th className="px-6 py-4">ID & Tanggal</th>
              <th className="px-6 py-4">Pemohon</th>
              <th className="px-6 py-4">Tipe</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(req => (
              <Fragment key={req.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 align-top">
                    <span className="font-mono text-xs text-gray-500">#{req.id}</span>
                    <div className="text-gray-900">{new Date(req.createdAt).toLocaleDateString("id-ID")}</div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="font-medium text-gray-900">{req.fullName}</div>
                    <div className="text-gray-500 text-xs">{req.email}</div>
                    {req.institution && <div className="text-blue-600 text-xs mt-1">{req.institution}</div>}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      req.requestType === "INFORMASI" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                    }`}>
                      {req.requestType}
                    </span>
                    {req.requestType === "INFORMASI" && (
                      <div className="mt-1 font-bold text-gray-700">Rp {req.totalAmount?.toLocaleString("id-ID")}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top">
                     <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                       req.status === "SUBMITTED" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                       req.status === "BILLING_ISSUED" ? "bg-blue-50 text-blue-700 border-blue-200" :
                       req.status === "PAYMENT_UPLOADED" ? "bg-purple-50 text-purple-700 border-purple-200" :
                       req.status === "COMPLETED" ? "bg-green-50 text-green-700 border-green-200" :
                       "bg-gray-50 text-gray-700 border-gray-200"
                     }`}>
                       {req.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <Button 
                      variant="outline" size="sm" 
                      onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                    >
                      {expandedId === req.id ? "Tutup" : "Kelola"}
                    </Button>
                  </td>
                </tr>
                {expandedId === req.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={5} className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Request Details */}
                        <div className="space-y-4">
                           <h3 className="font-bold text-gray-900 border-b pb-2">Detail Permintaan</h3>
                           
                           {req.items && req.items.length > 0 && (
                             <ul className="space-y-2">
                               {req.items.map((item: any) => (
                                 <li key={item.id} className="text-sm border-b pb-2">
                                   <div className="font-medium">{item.serviceName}</div>
                                   <div className="text-gray-500 flex justify-between">
                                     <span>{item.quantity} {item.unit}</span>
                                     <span>Rp {item.subtotal.toLocaleString("id-ID")}</span>
                                   </div>
                                 </li>
                               ))}
                             </ul>
                           )}
                           
                           {req.requestType === "NOL_RUPIAH" && (
                             <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg text-sm mb-4">
                               Permohonan Data Nol Rupiah (Rekomendasi / Penelitian). 
                               Tidak memerlukan pembayaran.
                             </div>
                           )}

                           {/* Penanggung Jawab Info */}
                           {req.penanggungJawab && (
                             <div className="bg-indigo-50 text-indigo-800 p-3 rounded-lg text-sm">
                               <strong>Penanggung Jawab:</strong> {req.penanggungJawab}
                             </div>
                           )}

                           <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                             {req.applicationLetterUrl && (
                               <a 
                                 href={req.applicationLetterUrl} 
                                 target="_blank" 
                                 className="flex items-center gap-2 text-blue-600 hover:underline"
                               >
                                 <FileText className="h-4 w-4" /> Surat Permohonan
                               </a>
                             )}
                             {/* Nol Rupiah Documents */}
                             {req.proposalUrl && (
                               <a href={req.proposalUrl} target="_blank" className="flex items-center gap-2 text-emerald-600 hover:underline">
                                 <FileText className="h-4 w-4" /> Proposal
                               </a>
                             )}
                             {req.introLetterUrl && (
                               <a href={req.introLetterUrl} target="_blank" className="flex items-center gap-2 text-emerald-600 hover:underline">
                                 <FileText className="h-4 w-4" /> Surat Pengantar
                               </a>
                             )}
                             
                             {req.paymentProofUrl && (
                               <a 
                                 href={req.paymentProofUrl} 
                                 target="_blank" 
                                 className="flex items-center gap-2 text-purple-600 hover:underline"
                               >
                                 <CreditCard className="h-4 w-4" /> Bukti Bayar
                               </a>
                             )}
                           </div>
                        </div>

                        {/* Actions Form */}
                        <div className="bg-white p-5 rounded-xl border shadow-sm">
                           <h3 className="font-bold text-gray-900 mb-4">Tindak Lanjut</h3>
                           
                           {/* STATUS: SUBMITTED */}
                           {(req.status === "SUBMITTED" || req.status === "REVIEWING") && (
                             <div className="space-y-4">
                               {req.requestType === "INFORMASI" && (
                                 <div>
                                   <Label>Kode Billing SIMPONI (Wajib jika setuju)</Label>
                                   <Input 
                                     placeholder="15 Digit Kode Billing" 
                                     value={billingCode}
                                     onChange={(e) => setBillingCode(e.target.value)}
                                   />
                                 </div>
                               )}

                               <div>
                                 <Label>Nama Penanggung Jawab</Label>
                                 <Input 
                                   placeholder="Nama penanggung jawab..." 
                                   value={penanggungJawab}
                                   onChange={(e) => setPenanggungJawab(e.target.value)}
                                 />
                                 <p className="text-xs text-gray-400 mt-1">Default: Carolina Meylita Sibarani, S.Tr.</p>
                               </div>
                               
                               <div>
                                 <Label>Catatan Tambahan (Opsional)</Label>
                                 <Textarea 
                                   placeholder="Catatan untuk pemohon..." 
                                   value={adminNotes}
                                   onChange={(e) => setAdminNotes(e.target.value)}
                                 />
                               </div>
                               <div className="flex gap-3 pt-2">
                                 <Button 
                                   className="bg-blue-600 hover:bg-blue-700 flex-1"
                                   onClick={() => handleAction(req.id, "REVIEW", { decision: "approve", billingCode, adminNotes, penanggungJawab })}
                                   disabled={!!processingId || (req.requestType === "INFORMASI" && !billingCode)}
                                 >
                                   {processingId === req.id ? "Memproses..." 
                                      : (req.requestType === "NOL_RUPIAH" ? "Setujui & Proses Data" : "Setujui & Terbitkan Billing")}
                                 </Button>
                                 <Button 
                                   variant="destructive"
                                   className="flex-1"
                                   onClick={() => {
                                      const reason = prompt("Masukkan alasan penolakan:");
                                      if (reason) handleAction(req.id, "REVIEW", { decision: "reject", rejectionReason: reason, adminNotes });
                                   }}
                                   disabled={!!processingId}
                                 >
                                   Tolak
                                 </Button>
                               </div>
                             </div>
                           )}

                           {/* STATUS: BILLING_ISSUED */}
                           {req.status === "BILLING_ISSUED" && (
                             <div className="text-center py-6 text-gray-500">
                               <Clock className="h-10 w-10 mx-auto mb-2 opacity-50" />
                               <p>Menunggu user mengupload bukti pembayaran.</p>
                               <div className="mt-2 font-mono bg-gray-100 p-2 rounded">
                                 Billing: {req.billingCode}
                               </div>
                               {req.penanggungJawab && (
                                 <div className="mt-2 text-sm bg-blue-50 text-blue-700 p-2 rounded">
                                   Penanggung Jawab: {req.penanggungJawab}
                                 </div>
                               )}
                             </div>
                           )}

                           {/* STATUS: PAYMENT_UPLOADED */}
                           {req.status === "PAYMENT_UPLOADED" && (
                             <div className="space-y-4">
                               <div className="bg-yellow-50 p-3 rounded-lg flex items-center gap-3 text-yellow-800 text-sm">
                                 <AlertCircle className="h-5 w-5" />
                                 Periksa bukti pembayaran sebelum konfirmasi.
                               </div>
                               <Button 
                                 className="w-full bg-emerald-600 hover:bg-emerald-700"
                                 onClick={() => handleAction(req.id, "CONFIRM_PAYMENT", { adminNotes })}
                                 disabled={!!processingId}
                               >
                                 <CheckCircle2 className="mr-2 h-4 w-4" />
                                 Konfirmasi Pembayaran Valid
                               </Button>
                             </div>
                           )}

                           {/* STATUS: PAYMENT_CONFIRMED */}
                           {(req.status === "PAYMENT_CONFIRMED" || req.status === "DATA_UPLOADED") && (
                             <div className="space-y-4">
                               <div>
                                 <Label>Upload Dokumen Data (Format .zip/.pdf)</Label>
                                 <Input 
                                   type="file" 
                                   onChange={(e) => setDataDocument(e.target.files?.[0] || null)}
                                 />
                               </div>
                               <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-lg">
                                 {req.status === "DATA_UPLOADED" ? "Data sudah diupload. Anda bisa mengupload ulang untuk merevisi." : "Upload data agar user dapat melanjutkan ke pengisian SKM."}
                               </div>
                               <Button 
                                 className="w-full bg-blue-600 hover:bg-blue-700"
                                 onClick={() => handleAction(req.id, "UPLOAD_DATA", { adminNotes })}
                                 disabled={!dataDocument || !!processingId}
                               >
                                 <UploadCloud className="mr-2 h-4 w-4" />
                                 {req.status === "DATA_UPLOADED" ? "Update Data" : "Upload Data & Kirim ke User"}
                               </Button>
                             </div>
                           )}

                           {/* STATUS: COMPLETED */}
                           {req.status === "COMPLETED" && (
                             <div className="bg-green-50 p-4 rounded-xl text-center">
                               <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-2" />
                               <h4 className="font-bold text-green-800">Permohonan Selesai</h4>
                               {req.penanggungJawab && (
                                 <p className="text-sm text-green-700 mt-1">PJ: {req.penanggungJawab}</p>
                               )}
                               <div className="mt-4 text-left bg-white p-3 rounded border">
                                 <p className="text-xs text-gray-500 mb-1">Rating SKM</p>
                                 <div className="flex gap-1 text-yellow-400 mb-2">
                                   {[...Array(req.skmRating || 0)].map((_: any, i: number) => <span key={i}>★</span>)}
                                 </div>
                                 <p className="text-xs text-gray-500 mb-1">Feedback</p>
                                 <p className="text-sm italic text-gray-700">"{req.skmFeedback}"</p>
                               </div>
                             </div>
                           )}

                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
