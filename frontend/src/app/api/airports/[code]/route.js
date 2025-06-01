import { NextResponse } from "next/server";

const airportDetails = {
  OTP: { city: "Bucharest", country: "Romania" },
  BCN: { city: "Barcelona", country: "Spain" },
  LHR: { city: "London", country: "United Kingdom" },
  JFK: { city: "New York", country: "United States" },
  LAX: { city: "Los Angeles", country: "United States" },
  TIA: { city: "Tirana", country: "Albania" },
  EVN: { city: "Yerevan", country: "Armenia" },
  VIE: { city: "Vienna", country: "Austria" },
  GYD: { city: "Baku", country: "Azerbaijan" },
  CRL: { city: "Brussels", country: "Belgium" },
  AMS: { city: "Amsterdam", country: "Netherlands" },
  CDG: { city: "Paris", country: "France" },
  FCO: { city: "Rome", country: "Italy" },
  MXP: { city: "Milan", country: "Italy" },
  MUC: { city: "Munich", country: "Germany" },
  BER: { city: "Berlin", country: "Germany" },
  CLJ: { city: "Cluj", country: "Romania" },
  MAD: { city: "Madrid", country: "Spain" },
  ATH: { city: "Athens", country: "Greece" },
  ZRH: { city: "Zurich", country: "Switzerland" },
  PRG: { city: "Prague", country: "Czech Republic" },
  WAW: { city: "Warsaw", country: "Poland" },
  BUD: { city: "Budapest", country: "Hungary" },
  OSL: { city: "Oslo", country: "Norway" },
  ARN: { city: "Stockholm", country: "Sweden" },
  CPH: { city: "Copenhagen", country: "Denmark" },
  HEL: { city: "Helsinki", country: "Finland" },
  DUB: { city: "Dublin", country: "Ireland" },
  EDI: { city: "Edinburgh", country: "United Kingdom" },
  MAN: { city: "Manchester", country: "United Kingdom" },
  LIS: { city: "Lisbon", country: "Portugal" },
  OPO: { city: "Porto", country: "Portugal" },
};

export async function GET(request, { params }) {
  try {
    const code = params.code.toUpperCase();

    if (!airportDetails[code]) {
      return new NextResponse(JSON.stringify({ error: "Airport not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new NextResponse(JSON.stringify(airportDetails[code]), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
