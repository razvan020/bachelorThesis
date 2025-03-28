package org.example.xlr8travel.models;


public enum SeatPrice {
    SEAT_PRICE_UPFRONT(10.00f),
    SEAT_PRICE_EXTRA_LEGROOM(13.00f),
    SEAT_PRICE_STANDARD(7.00f),
    SEAT_PRICE_UNAVAILABLE(0.00f);

    private final float price; // float to hold the price associated with each type

    SeatPrice(float price) {
        this.price = price;
    }

    public float getPrice() {
        return this.price;
    }

    // Adjusted to return SeatPrice instead of float
    public static SeatPrice getPriceByType(SeatType type) {
        switch (type) {
            case SEAT_TYPE_UPFRONT:
                return  SEAT_PRICE_UPFRONT;
            case SEAT_TYPE_EXTRA_LEGROOM:
                return  SEAT_PRICE_EXTRA_LEGROOM;
            case SEAT_TYPE_STANDARD:
                return  SEAT_PRICE_STANDARD;
            case SEAT_TYPE_UNAVAILABLE:
                return  SEAT_PRICE_UNAVAILABLE;
            default:
                throw new IllegalArgumentException("Unknown Seat Type: " + type);
        }
    }
}
