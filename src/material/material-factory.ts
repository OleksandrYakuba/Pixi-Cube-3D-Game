import { Material } from "./material"

/**
 * Factory for creating materials.
 */
export interface MaterialFactory {
  /**
   * Creates a new material from the specified source.
   * @param source The source of the material.
   */
  create(source: unknown): Material
}