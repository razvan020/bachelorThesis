package org.example.xlr8travel.services;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.WriterException;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import org.example.xlr8travel.models.Ticket;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class BoardingPassPdfService {

    private static final Logger log = LoggerFactory.getLogger(BoardingPassPdfService.class);
    private static final int QR_CODE_SIZE = 200;

    // Define colors matching your UI theme
    private static final DeviceRgb ORANGE_COLOR = new DeviceRgb(255, 111, 0);
    private static final DeviceRgb DARK_COLOR = new DeviceRgb(15, 23, 42);
    private static final DeviceRgb LIGHT_GRAY = new DeviceRgb(148, 163, 184);

    public byte[] generateBoardingPassPdf(Ticket ticket) throws IOException, WriterException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc, PageSize.A4);

        // Set margins
        document.setMargins(30, 30, 30, 30);

        try {
            // Load fonts
            PdfFont boldFont = PdfFontFactory.createFont();
            PdfFont regularFont = PdfFontFactory.createFont();

            // Add title
            addTitle(document, boldFont);

            // Add main boarding pass content
            addBoardingPassContent(document, ticket, boldFont, regularFont);

            // Add QR code
            addQrCode(document, ticket);

            // Add footer
            addFooter(document, regularFont);

        } finally {
            document.close();
        }

        return baos.toByteArray();
    }

    private void addTitle(Document document, PdfFont boldFont) {
        Paragraph title = new Paragraph("BOARDING PASS")
                .setFont(boldFont)
                .setFontSize(24)
                .setFontColor(ORANGE_COLOR)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(title);
    }

    private void addBoardingPassContent(Document document, Ticket ticket, PdfFont boldFont, PdfFont regularFont) {
        // Create main table
        Table mainTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                .setWidth(UnitValue.createPercentValue(100))
                .setBorder(new SolidBorder(ORANGE_COLOR, 2))
                .setMarginBottom(20);

        // Left column - Flight details
        Cell leftCell = createFlightDetailsCell(ticket, boldFont, regularFont);
        mainTable.addCell(leftCell);

        // Right column - Passenger and seat details
        Cell rightCell = createPassengerDetailsCell(ticket, boldFont, regularFont);
        mainTable.addCell(rightCell);

        document.add(mainTable);
    }

    private Cell createFlightDetailsCell(Ticket ticket, PdfFont boldFont, PdfFont regularFont) {
        Cell cell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setPadding(15);

        // Flight number
        cell.add(createLabelValuePair("Flight", ticket.getFlight().getName(), boldFont, regularFont));

        // Route
        String route = ticket.getFlight().getOrigin() + " → " + ticket.getFlight().getDestination();
        cell.add(createLabelValuePair("Route", route, boldFont, regularFont));

        // Date and time
        if (ticket.getFlight().getDepartureDate() != null) {
            String date = ticket.getFlight().getDepartureDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            cell.add(createLabelValuePair("Date", date, boldFont, regularFont));
        }

        if (ticket.getFlight().getDepartureTime() != null) {
            String time = ticket.getFlight().getDepartureTime().format(DateTimeFormatter.ofPattern("HH:mm"));
            cell.add(createLabelValuePair("Departure", time, boldFont, regularFont));
        }

        // Gate and terminal
        if (ticket.getFlight().getGate() != null) {
            cell.add(createLabelValuePair("Gate", ticket.getFlight().getGate(), boldFont, regularFont));
        }

        if (ticket.getFlight().getTerminal() != null) {
            cell.add(createLabelValuePair("Terminal", ticket.getFlight().getTerminal(), boldFont, regularFont));
        }

        return cell;
    }

    private Cell createPassengerDetailsCell(Ticket ticket, PdfFont boldFont, PdfFont regularFont) {
        Cell cell = new Cell()
                .setBorder(Border.NO_BORDER)
                .setPadding(15);

        // Passenger name
        String passengerName = ticket.getUser().getFirstname() + " " + ticket.getUser().getLastname();
        cell.add(createLabelValuePair("Passenger", passengerName, boldFont, regularFont));

        // Seat information
        if (ticket.getSeat() != null) {
            cell.add(createLabelValuePair("Seat", ticket.getSeat().getSeatNumber(), boldFont, regularFont));

            String seatType = ticket.getSeat().getSeatType().toString()
                    .replace("SEAT_TYPE_", "")
                    .replace("_", " ");
            cell.add(createLabelValuePair("Seat Type", seatType, boldFont, regularFont));
        }

        // Ticket ID
        cell.add(createLabelValuePair("Ticket ID", ticket.getId().toString(), boldFont, regularFont));

        // Status
        String status = ticket.getTicketStatus().toString().replace("TICKET_STATUS_", "");
        cell.add(createLabelValuePair("Status", status, boldFont, regularFont));

        return cell;
    }

    private Paragraph createLabelValuePair(String label, String value, PdfFont boldFont, PdfFont regularFont) {
        return new Paragraph()
                .add(new Text(label + ": ").setFont(boldFont).setFontColor(DARK_COLOR))
                .add(new Text(value).setFont(regularFont).setFontColor(ColorConstants.BLACK))
                .setMarginBottom(8);
    }

    private void addQrCode(Document document, Ticket ticket) throws WriterException, IOException {
        // Create QR code data
        String qrData = createQrCodeData(ticket);

        // Generate QR code
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(qrData, BarcodeFormat.QR_CODE, QR_CODE_SIZE, QR_CODE_SIZE);

        // Convert to image
        ByteArrayOutputStream qrOutputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", qrOutputStream);

        // Add QR code to PDF
        Image qrImage = new Image(ImageDataFactory.create(qrOutputStream.toByteArray()))
                .setWidth(120)
                .setHeight(120);

        Table qrTable = new Table(1)
                .setWidth(UnitValue.createPercentValue(100))
                .setTextAlignment(TextAlignment.CENTER);

        Cell qrCell = new Cell()
                .add(qrImage)
                .add(new Paragraph("Scan at gate").setFontSize(10).setFontColor(LIGHT_GRAY))
                .setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.CENTER);

        qrTable.addCell(qrCell);
        document.add(qrTable);
    }

    private String createQrCodeData(Ticket ticket) {
        // Create structured data for QR code
        StringBuilder qrData = new StringBuilder();
        qrData.append("TICKET_ID:").append(ticket.getId()).append("|");
        qrData.append("FLIGHT:").append(ticket.getFlight().getName()).append("|");
        qrData.append("PASSENGER:").append(ticket.getUser().getFirstname()).append(" ").append(ticket.getUser().getLastname()).append("|");
        qrData.append("ORIGIN:").append(ticket.getFlight().getOrigin()).append("|");
        qrData.append("DESTINATION:").append(ticket.getFlight().getDestination()).append("|");

        if (ticket.getFlight().getDepartureDate() != null) {
            qrData.append("DATE:").append(ticket.getFlight().getDepartureDate().toString()).append("|");
        }

        if (ticket.getFlight().getDepartureTime() != null) {
            qrData.append("TIME:").append(ticket.getFlight().getDepartureTime().toString()).append("|");
        }

        if (ticket.getSeat() != null) {
            qrData.append("SEAT:").append(ticket.getSeat().getSeatNumber()).append("|");
        }

        if (ticket.getFlight().getGate() != null) {
            qrData.append("GATE:").append(ticket.getFlight().getGate()).append("|");
        }

        qrData.append("STATUS:").append(ticket.getTicketStatus().toString());

        return qrData.toString();
    }

    private void addFooter(Document document, PdfFont regularFont) {
        Paragraph footer = new Paragraph("Please arrive at the airport at least 2 hours before departure. Keep this boarding pass with you at all times.")
                .setFont(regularFont)
                .setFontSize(10)
                .setFontColor(LIGHT_GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(20);

        document.add(footer);

        // Add XLR8 Travel branding
        Paragraph branding = new Paragraph("XLR8 Travel - Your Journey, Our Priority")
                .setFont(regularFont)
                .setFontSize(8)
                .setFontColor(ORANGE_COLOR)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(10);

        document.add(branding);
    }
}