package org.example.xlr8travel.models;

public enum BaggageTypePrice {
    BAGGAGE_TYPE_PRICE_CARRY_ON_0(0.0f, BaggageTypeWeight.BAGGAGE_TYPE_WEIGHT_CARRY_ON_0), // Free carry-on

    BAGGAGE_TYPE_PRICE_CHECKED_10(20.0f, BaggageTypeWeight.BAGGAGE_TYPE_WEIGHT_CHECKED_10), // 10kg baggage
    BAGGAGE_TYPE_PRICE_CHECKED_20(30.0f, BaggageTypeWeight.BAGGAGE_TYPE_WEIGHT_CHECKED_20), // 20kg baggage
    BAGGAGE_TYPE_PRICE_CHECKED_26(40.0f, BaggageTypeWeight.BAGGAGE_TYPE_WEIGHT_CHECKED_26), // 26kg baggage
    BAGGAGE_TYPE_PRICE_CHECKED_32(50.0f, BaggageTypeWeight.BAGGAGE_TYPE_WEIGHT_CHECKED_32); // 32kg baggage

    private final float price;
    private final BaggageTypeWeight weightType;

    BaggageTypePrice(float price, BaggageTypeWeight weightType) {
        this.price = price;
        this.weightType = weightType;
    }

    public float getPrice() {
        return this.price;
    }


    public static BaggageTypePrice determinePrice(BaggageTypeWeight weightType) {
        for (BaggageTypePrice price : values()) {
            if (price.weightType == weightType) {
                return price;
            }
        }
        return null;
    }
}
