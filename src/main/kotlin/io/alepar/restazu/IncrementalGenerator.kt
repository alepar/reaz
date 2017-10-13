package io.alepar.restazu

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.JsonNodeType
import com.fasterxml.jackson.databind.node.MissingNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.google.common.cache.Cache
import com.google.common.cache.CacheBuilder
import com.google.common.primitives.Longs
import java.util.*
import java.util.concurrent.TimeUnit

interface IncrementalGenerator {
    fun <T: Any> start(value: T): RestIncremental
    fun incremental(token: String, newvalue: Any): RestIncremental;
}

class GuavaJacksonIncrementalGenerator : IncrementalGenerator {

    private val mapper = ObjectMapper()
    private val cache : Cache<String, JsonNode> = CacheBuilder.newBuilder()
            .maximumSize(100)
            .expireAfterWrite(1, TimeUnit.MINUTES)
            .build();

    override fun <T: Any> start(value: T): RestIncremental {
        val token = generateRandomToken();
        val jsonNode = toJsonNode(value)
        cache.put(token, jsonNode);
        return RestIncremental(token, RestJsonDiff(jsonNode, emptyList()));
    }

    override fun incremental(token: String, newvalue: Any): RestIncremental {
        val oldnode = cache.get(token) { MissingNode.getInstance() }
        if (oldnode == MissingNode.getInstance()) {
            return start(newvalue);
        } else {
            cache.invalidate(token)
        }

        val newnode = toJsonNode(newvalue)
        val newtoken = generateRandomToken()
        cache.put(newtoken, newnode)

        return RestIncremental(newtoken, calculateDiff(oldnode, newnode))
    }

    fun calculateDiff(oldnode: JsonNode, newnode: JsonNode): RestJsonDiff {
        val updated = mapper.createObjectNode()
        val deleted = ArrayList<List<String>>()

        recurseDiffs(ArrayList(), oldnode, newnode, updated, deleted)

        return RestJsonDiff(updated, deleted);
    }

    private fun recurseDiffs(path: List<String>, oldnode: JsonNode, newnode: JsonNode, updated: ObjectNode, deleted: MutableList<List<String>>) {
        if (newnode.nodeType != oldnode.nodeType) {
            putUpdated(path, newnode, updated)
        } else if (newnode is ObjectNode && oldnode is ObjectNode) {
            val fieldNames = HashSet<String>();
            for (fieldName in newnode.fieldNames()) {
                fieldNames.add(fieldName)
            }
            for (fieldName in oldnode.fieldNames()) {
                fieldNames.add(fieldName)
            }

            for (fieldName in fieldNames) {
                val concat = concat(path, fieldName)
                if (oldnode.has(fieldName) && !newnode.has(fieldName)) {
                    putDeleted(concat, deleted)
                } else if(!oldnode.has(fieldName) && newnode.has(fieldName)) {
                    putUpdated(concat, newnode.get(fieldName), updated)
                } else {
                    recurseDiffs(concat, oldnode.get(fieldName), newnode.get(fieldName), updated, deleted)
                }
            }
        } else if (newnode.nodeType == JsonNodeType.ARRAY) {
            // diffing/patching arrays is tough, use maps instead
            putUpdated(path, newnode, updated);
        } else if (newnode.asText() != oldnode.asText()) {
            putUpdated(path, newnode, updated);
        }
    }

    private fun putUpdated(path: List<String>, value: JsonNode, updated: ObjectNode) {
        val remaining = ArrayList(path)
        var node = updated

        while(remaining.size > 1) {
            val field = remaining.removeAt(0)

            if (!node.has(field)) {
                node.set(field, mapper.createObjectNode())
            }

            val child = node.get(field)
            if (child !is ObjectNode) {
                throw IllegalStateException("not an object node: " + path.toString())
            }

            node = child
        }

        node.set(remaining.first(), value)
    }

    private fun putDeleted(path: List<String>, deleted: MutableList<List<String>>) {
        deleted.add(path);
    }

    private fun <T> concat(list: List<T>, tail: T): List<T> {
        val newpath = ArrayList(list)
        newpath.add(tail);
        return newpath;
    }

    private fun generateRandomToken(): String {
        val uuid = UUID.randomUUID()
        val encoder = Base64.getEncoder()

        return String(encoder.encode(
                Longs.toByteArray(uuid.mostSignificantBits) +
                Longs.toByteArray(uuid.leastSignificantBits)
        ), 0, 22) // remove padding
    }

    private fun toJsonNode(value: Any): JsonNode {
        return mapper.readTree(mapper.writeValueAsString(value))
    }
}