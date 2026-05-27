import { createAction } from '@reduxjs/toolkit'

export const fetchRequest = createAction('fetch inmobiliaria designs')
export const beginRequestFetch = createAction('begin fetch inmobiliaria designs')
export const successRequestFetch = createAction('success fetch inmobiliaria designs')
export const errorRequestFetch = createAction('error fetch inmobiliaria designs')

export const createRequest = createAction('create inmobiliaria design')
export const beginRequestCreate = createAction('begin create inmobiliaria design')
export const successRequestCreate = createAction('success create inmobiliaria design')
export const errorRequestCreate = createAction('error create inmobiliaria design')

export const updateRequest = createAction('update inmobiliaria design')
export const beginRequestUpdate = createAction('begin update inmobiliaria design')
export const successRequestUpdate = createAction('success update inmobiliaria design')
export const errorRequestUpdate = createAction('error update inmobiliaria design')

export const deleteRequest = createAction('delete inmobiliaria design')
export const beginRequestDelete = createAction('begin delete inmobiliaria design')
export const successRequestDelete = createAction('success delete inmobiliaria design')
export const errorRequestDelete = createAction('error delete inmobiliaria design')

export const loadRequest = createAction('load inmobiliaria design')
export const beginRequestLoad = createAction('begin load inmobiliaria design')
export const successRequestLoad = createAction('success load inmobiliaria design')
export const errorRequestLoad = createAction('error load inmobiliaria design')

export const cloneRequest = createAction('clone inmobiliaria design')
export const beginRequestClone = createAction('begin clone inmobiliaria design')
export const successRequestClone = createAction('success clone inmobiliaria design')
export const errorRequestClone = createAction('error clone inmobiliaria design')

export const selectDesign = createAction('select inmobiliaria design')
export const clearDesign = createAction('clear inmobiliaria design')
