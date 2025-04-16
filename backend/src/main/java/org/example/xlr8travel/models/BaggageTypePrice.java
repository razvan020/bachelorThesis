package org.example.xlr8travel.models;

public enum BaggageTypePrice {
    BAGGAGE_TYPE_PRICE_CARRY_ON_7(0.0f, BaggageTypeWeight.BAGGAGE_TYPE_WEIGHT_CARRY_ON_7),
    BAGGAGE_TYPE_PRICE_CARRY_ON_14(25.0f, BaggageTypeWeight.BAGGAGE_TYPE_WEIGHT_CARRY_ON_14),

    BAGGAGE_TYPE_PRICE_CHECKED_0(0.0f, BaggageTypeWeight.BAGGAGE_TYPE_WEIGHT_CHECKED_0),
    BAGGAGE_TYPE_PRICE_CHECKED_15(25.0f, BaggageTypeWeight.BAGGAGE_TYPE_WEIGHT_CHECKED_15),
    BAGGAGE_TYPE_PRICE_CHECKED_20(29.0f, BaggageTypeWeight.BAGGAGE_TYPE_WEIGHT_CHECKED_20),
    BAGGAGE_TYPE_PRICE_CHECKED_30(35.0f, BaggageTypeWeight.BAGGAGE_TYPE_WEIGHT_CHECKED_30),
    BAGGAGE_TYPE_PRICE_CHECKED_40(55.0f, BaggageTypeWeight.BAGGAGE_TYPE_WEIGHT_CHECKED_40);

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
