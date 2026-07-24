package com.habitengine.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Spring AI configuration.
 * <p>
 * Spring AI 2.x auto-configures a {@link ChatClient.Builder} but NOT a {@link ChatClient} bean.
 * This config builds and exposes the {@link ChatClient} singleton so it can be injected anywhere.
 */
@Configuration
public class AiConfig {

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder) {
        return builder.build();
    }
}
