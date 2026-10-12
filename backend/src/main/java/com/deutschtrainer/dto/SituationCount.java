package com.deutschtrainer.dto;

/** Phrase count for one communication situation: {situation, count}. */
public record SituationCount(String situation, long count) {
}
