import _shortUUID from "short-uuid"

export function shortUUID() {
  return _shortUUID.generate() as string
}

export function newId(){
  return _shortUUID.generate() as string
}