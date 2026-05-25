import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from './formatDate.js';
import { formatRupiah } from './formatRupiah.js';

const formatRupiahPlain = (value) => {
  const number = Number(value) || 0;
  return `Rp ${number.toLocaleString('id-ID')}`;
};

export const exportLaporanPdf = ({ data, bulan, tahun, summary, adminName }) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const periodeLabel = bulan ? `${bulan} ${tahun}` : `Tahun ${tahun}`;
  const cetakDate = new Date().toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('LAPORAN PEMBAYARAN INDEKOS', margin, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Sistem Informasi Manajemen Data Anak Indekos', margin, 23);
  doc.text(`Periode: ${periodeLabel}`, margin, 29);
  doc.text(`Tanggal cetak: ${cetakDate}`, margin, 34);

  let y = 48;
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Ringkasan', margin, y);
  y += 6;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const summaryLines = [
    `Total Tagihan: ${formatRupiahPlain(summary?.total_tagihan || 0)}`,
    `Pendapatan Masuk: ${formatRupiahPlain(summary?.total_pendapatan || 0)}`,
    `Total Sisa Tagihan: ${formatRupiahPlain(summary?.total_sisa_tagihan || 0)}`,
    `Lunas: ${summary?.pembayaran_lunas || 0} | Cicil: ${summary?.pembayaran_cicil || 0} | Belum Lunas: ${summary?.pembayaran_belum_lunas || 0}`,
  ];
  summaryLines.forEach((line) => {
    doc.text(line, margin, y);
    y += 5;
  });

  y += 4;

  const tableBody = (data || []).map((row, index) => [
    index + 1,
    row.nama_penghuni || '-',
    row.nomor_kamar || '-',
    `${row.bulan || '-'} ${row.tahun || ''}`,
    formatRupiahPlain(row.nominal),
    formatRupiahPlain(row.total_dibayar),
    formatRupiahPlain(row.sisa_tagihan),
    row.status || '-',
    row.info_cicilan || '-',
  ]);

  autoTable(doc, {
    startY: y,
    head: [[
      'No',
      'Nama',
      'Kamar',
      'Periode',
      'Tagihan',
      'Dibayar',
      'Sisa',
      'Status',
      'Cicilan',
    ]],
    body: tableBody,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8,
      cellPadding: 2,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      5: { halign: 'right' },
      6: { halign: 'center' },
    },
    didDrawPage: (hookData) => {
      const pageCount = doc.internal.getNumberOfPages();
      const pageHeight = doc.internal.pageSize.getHeight();
      const footerY = pageHeight - 22;

      doc.setDrawColor(226, 232, 240);
      doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Dicetak oleh: ${adminName || 'Administrator'}`, margin, footerY);

      doc.text('Mengetahui,', pageWidth - margin - 40, footerY);
      doc.text('Pengelola Indekos', pageWidth - margin - 40, footerY + 5);
      doc.line(pageWidth - margin - 45, footerY + 18, pageWidth - margin, footerY + 18);

      doc.setFontSize(8);
      doc.text(
        `Halaman ${hookData.pageNumber} dari ${pageCount}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );
    },
  });

  const bulanFile = (bulan || 'semua-bulan').toLowerCase().replace(/\s+/g, '-');
  const tahunFile = tahun || 'semua';
  doc.save(`laporan-pembayaran-indekos-${bulanFile}-${tahunFile}.pdf`);
};
