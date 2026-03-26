package com.shoptrack.config;

import com.shoptrack.model.Product;
import com.shoptrack.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {
    private final ProductRepository productRepository;

    public DataSeeder(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        if (productRepository.count() == 0) {
            Product laptop = new Product();
            laptop.setName("Laptop");
            laptop.setDescription("High-performance laptop");
            laptop.setPrice(999.99);
            laptop.setStock(50);
            productRepository.save(laptop);

            Product mouse = new Product();
            mouse.setName("Mouse");
            mouse.setDescription("Wireless mouse");
            mouse.setPrice(29.99);
            mouse.setStock(200);
            productRepository.save(mouse);

            Product keyboard = new Product();
            keyboard.setName("Keyboard");
            keyboard.setDescription("Mechanical keyboard");
            keyboard.setPrice(79.99);
            keyboard.setStock(100);
            productRepository.save(keyboard);
        }
    }
}
