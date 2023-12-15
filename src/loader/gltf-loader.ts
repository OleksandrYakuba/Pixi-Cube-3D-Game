import type { ILoaderResource, Loader } from "@pixi/loaders"
import { Compatibility } from "../compatibility/compatibility"
import { LoaderResourceResponseType } from "../compatibility/compatibility-version"
import { glTFAsset } from "../gltf/gltf-asset"
import { glTFResourceLoader } from "../gltf/gltf-resource-loader"

export const glTFLoader = {
  use: function (resource: ILoaderResource, next: () => void) {
    if (resource.extension !== "gltf") {
      return next()
    }
    let loader = <Loader><unknown>this
    glTFAsset.load(resource.data, new glTFExternalResourceLoader(loader, resource), gltf => {
      Object.assign(resource, { gltf }); next()
    })
  },
  add: function () {
    Compatibility.setLoaderResourceExtensionType("bin",
      LoaderResourceResponseType.buffer)
    Compatibility.setLoaderResourceExtensionType("gltf",
      LoaderResourceResponseType.json)
  },
  test(url: string): boolean {
    return url.includes(".gltf") || url.includes(".glb")
  },
  async load(url: string): Promise<glTFAsset> {
    return await glTFAsset.fromURL(url)
  },
}

Compatibility.installLoaderPlugin("gltf", glTFLoader)

class glTFExternalResourceLoader implements glTFResourceLoader {
  constructor(private _loader: Loader, private _resource: ILoaderResource) {
  }

  load(uri: string, onComplete: (resource: ILoaderResource) => void) {
    const url = this._resource.url.substring(
      0, this._resource.url.lastIndexOf("/") + 1) + uri

    if (!this._loader.resources[url]) {
      // The resource does not exists and needs to be loaded.
      // @ts-ignore
      this._loader.add({ parentResource: this._resource, url, onComplete })
    } else if (this._loader.resources[url].data) {
      // The resource already exists, just use that one.
      onComplete(this._loader.resources[url])
    } else {
      // The resource is in queue to be loaded, wait for it.
      let binding = this._loader.onProgress.add((_, resource) => {
        if (resource.url === url) {
          onComplete(resource); binding.detach()
        }
      })
    }
  }
}