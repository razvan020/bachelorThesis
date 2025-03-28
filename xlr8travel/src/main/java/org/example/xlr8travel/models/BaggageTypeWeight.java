package org.example.xlr8travel.models;

public enum BaggageTypeWeight {
    BAGGAGE_TYPE_WEIGHT_CARRY_ON_7(7, BaggageType.BAGGAGE_TYPE_CARRY_ON),
    BAGGAGE_TYPE_WEIGHT_CARRY_ON_14(14, BaggageType.BAGGAGE_TYPE_CARRY_ON),
    BAGGAGE_TYPE_WEIGHT_CHECKED_0(0, BaggageType.BAGGAGE_TYPE_CHECKED),
    BAGGAGE_TYPE_WEIGHT_CHECKED_15(15, BaggageType.BAGGAGE_TYPE_CHECKED),
    BAGGAGE_TYPE_WEIGHT_CHECKED_20(20, BaggageType.BAGGAGE_TYPE_CHECKED),
    BAGGAGE_TYPE_WEIGHT_CHECKED_30(30, BaggageType.BAGGAGE_TYPE_CHECKED),
    BAGGAGE_TYPE_WEIGHT_CHECKED_40(40, BaggageType.BAGGAGE_TYPE_CHECKED);


    private final int weight;
    private final BaggageType type;

    BaggageTypeWeight(int weight, BaggageType type) {
        this.weight = weight;
        this.type = type;
    }

    public int getWeight() {
        return this.weight;
    }


    public static BaggageTypeWeight determineWeight(BaggageType type) {
        for (BaggageTypeWeight weight : values()) {
            if (weight.type == type) {
                return weight;
            }
        }
        return null;
    }
}
