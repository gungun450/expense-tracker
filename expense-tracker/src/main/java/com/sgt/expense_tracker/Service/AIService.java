package com.sgt.expense_tracker.Service;


import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class AIService {

    @Autowired
    ChatModel chatModel;

    public String suggestCategory(String description, List<String> categories){

  String prompt = """
                Categorize this description: "{description}"
                Available categories: {categories}

              Rules:
              - Pick from the list if possible.
              - If not, suggest a new one-word category.
              - Answer must be exactly ONE WORD only.
        """;

        PromptTemplate promptTemplate = new PromptTemplate(prompt);

        Map<String,Object> params = Map.of(
                "description", description,
                "categories", categories
        );
        return chatModel.call(promptTemplate.create(params)).getResult().getOutput().getText();
    }
}
