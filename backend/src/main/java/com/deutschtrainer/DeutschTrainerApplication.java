package com.deutschtrainer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
public class DeutschTrainerApplication {
    public static void main(String[] args) {
        loadDotenv();
        SpringApplication.run(DeutschTrainerApplication.class, args);
    }

    private static void loadDotenv() {
        Path[] candidates = new Path[]{
            Paths.get(".env"),
            Paths.get("backend", ".env"),
            Paths.get("..", ".env")
        };
        for (Path p : candidates) {
            if (Files.exists(p) && Files.isRegularFile(p)) {
                try {
                    List<String> lines = Files.readAllLines(p);
                    for (String line : lines) {
                        String trimmed = line.trim();
                        if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                            continue;
                        }
                        int eq = trimmed.indexOf('=');
                        if (eq > 0) {
                            String key = trimmed.substring(0, eq).trim();
                            String val = trimmed.substring(eq + 1).trim();
                            if ((val.startsWith("\"") && val.endsWith("\"") && val.length() >= 2) ||
                                (val.startsWith("'") && val.endsWith("'") && val.length() >= 2)) {
                                val = val.substring(1, val.length() - 1);
                            }
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, val);
                            }
                        }
                    }
                    break;
                } catch (IOException ignored) {
                }
            }
        }
    }
}
