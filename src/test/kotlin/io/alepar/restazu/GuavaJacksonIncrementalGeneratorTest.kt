package io.alepar.restazu

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import org.hamcrest.Matchers.*
import org.junit.Assert.*
import org.junit.Test

class GuavaJacksonIncrementalGeneratorTest {

    private val differ = GuavaJacksonIncrementalGenerator()
    private val mapper = ObjectMapper()

    @Test
    fun diffJsons() {
        val (updated, deleted) = differ.calculateDiff(
                mapper.readTree(this.javaClass.classLoader.getResourceAsStream("left.json")),
                mapper.readTree(this.javaClass.classLoader.getResourceAsStream("right.json"))
        )

        assertThat(deleted, hasSize(2))
        assertThat(deleted, hasItem(listOf("deleted")))
        assertThat(deleted, hasItem(listOf("obj", "deleted")))

        assertThat(updated.size(), equalTo(4))
        assertTrue(updated.has("arr"))
        assertTrue(updated.has("int"))
        assertTrue(updated.has("created"))
        assertTrue(updated.has("obj"))

        val nested = updated.get("obj") as? ObjectNode ?: throw AssertionError("nested obj is not Object")
        assertThat(nested.size(), equalTo(3))
        assertTrue(nested.has("arr"))
        assertTrue(nested.has("int"))
        assertTrue(nested.has("created"))
    }
}