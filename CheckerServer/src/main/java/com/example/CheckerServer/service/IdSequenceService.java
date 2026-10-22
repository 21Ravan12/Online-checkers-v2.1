package com.example.CheckerServer.service;

import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import com.example.CheckerServer.model.IdSequence;

@Service
public class IdSequenceService {
    private final MongoTemplate mongoTemplate;

    public IdSequenceService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public long nextId(String sequenceName) {
        IdSequence sequence = mongoTemplate.findAndModify(
                Query.query(Criteria.where("_id").is(sequenceName)),
                new Update().inc("value", 1),
                FindAndModifyOptions.options().upsert(true).returnNew(true),
                IdSequence.class);

        if (sequence == null) {
            throw new IllegalStateException("Could not generate an ID for " + sequenceName + ".");
        }
        return sequence.getValue();
    }
}
