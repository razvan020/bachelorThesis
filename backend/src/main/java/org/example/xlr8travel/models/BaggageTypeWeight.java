package org.example.xlr8travel.models;

public enum BaggageTypeWeight {
    BAGGAGE_TYPE_WEIGHT_CARRY_ON_0(0, BaggageType.BAGGAGE_TYPE_CARRY_ON), // Free carry-on
    BAGGAGE_TYPE_WEIGHT_CHECKED_10(10, BaggageType.BAGGAGE_TYPE_CHECKED), // New required weight
    BAGGAGE_TYPE_WEIGHT_CHECKED_20(20, BaggageType.BAGGAGE_TYPE_CHECKED), // Already exists
    BAGGAGE_TYPE_WEIGHT_CHECKED_26(26, BaggageType.BAGGAGE_TYPE_CHECKED), // New required weight
    BAGGAGE_TYPE_WEIGHT_CHECKED_32(32, BaggageType.BAGGAGE_TYPE_CHECKED); // New required weight


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
