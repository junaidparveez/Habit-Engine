package com.levelupai.config;

import com.levelupai.entity.Category;
import com.levelupai.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Data initializer to seed default data on application startup.
 * Seeds standard category groups if none exist in the database.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        log.info("Checking database for categories...");

        if (categoryRepository.count() == 0) {
            log.info("No categories found. Seeding default categories...");

            List<Category> defaultCategories = List.of(
                    Category.builder().name("Health").color("#10B981").icon("Favorite").sortOrder(1).build(),
                    Category.builder().name("Work").color("#3B82F6").icon("Work").sortOrder(2).build(),
                    Category.builder().name("Fitness").color("#EF4444").icon("DirectionsRun").sortOrder(3).build(),
                    Category.builder().name("Finance").color("#F59E0B").icon("AttachMoney").sortOrder(4).build(),
                    Category.builder().name("Mind").color("#8B5CF6").icon("SelfImprovement").sortOrder(5).build(),
                    Category.builder().name("Social").color("#EC4899").icon("People").sortOrder(6).build()
            );

            categoryRepository.saveAll(defaultCategories);
            log.info("Successfully seeded {} default categories.", defaultCategories.size());
        } else {
            log.info("Categories already exist. Skipping seed.");
        }
    }
}
