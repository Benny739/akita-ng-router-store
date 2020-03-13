import { Injectable } from '@angular/core';
import { RouterStore, RouterState } from './router.store';
import { Query, HashMap, filterNil } from '@datorama/akita';
import { Observable, combineLatest } from 'rxjs';
import { map, pluck, distinctUntilChanged } from 'rxjs/operators';
import { RouterStateSnapshot, Data } from '@angular/router';

function slice(section: string) {
  return (source: Observable<RouterState<RouterStateSnapshot>>) => {
    return source.pipe(map(data => data.state)).pipe(
      filterNil,
      map(state => (state!.root as any)[section])
    );
  };
}

@Injectable()
export class RouterQuery extends Query<RouterState> {
  constructor(protected store: RouterStore) {
    super(store);
  }

  selectParams<T = string>(names: string): Observable<T>;
  selectParams<T = string>(names: string[]): Observable<T[]>;
  selectParams<T = string>(): Observable<HashMap<T>>;
  selectParams<T = string>(names?: string | string[]): Observable<T | T[] | HashMap<T>> {
    if (names === undefined) {
      return this.select().pipe(slice('params'), distinctUntilChanged());
    }

    const select = (p: string) =>
      this.select().pipe(
        slice('params'),
        pluck(p),
        distinctUntilChanged()
      );

    if (Array.isArray(names)) {
      const sources = names.map(select);
      return combineLatest(sources);
    }

    return select(names).pipe(distinctUntilChanged());
  }

  getParams<T = string>(): HashMap<T>;
  getParams<T = string>(name: string): T;
  getParams<T = string>(name?: string): T | HashMap<any> | null {
  if (this.getValue().state) {
      const params = this.getValue().state!.root.params;
      if (name === undefined) {
        return params;
      }

      return params[name];
    }

    return null;
  }

  selectQueryParams<T = string>(names: string): Observable<T>;
  selectQueryParams<T = string>(names: string[]): Observable<T[]>;
  selectQueryParams<T = string>(): Observable<HashMap<T>>;
  selectQueryParams<T = string>(names?: string | string[]): Observable<T | T[] | HashMap<T>> {
    if (names === undefined) {
      return this.select().pipe(slice('queryParams'), distinctUntilChanged());
    }

    const select = (p: string) =>
      this.select().pipe(
        slice('queryParams'),
        pluck(p),
        distinctUntilChanged()
      );

    if (Array.isArray(names)) {
      const sources = names.map(select);
      return combineLatest(sources);
    }

    return select(names);
  }

  getQueryParams<T = string>(name: string): T;
  getQueryParams<T = string>(): HashMap<T>;
  getQueryParams<T = string>(name?: string): T | HashMap<T> | null {
    if (this.getValue().state) {
      const params = this.getValue().state!.root.queryParams;
      if (name === undefined) {
        return params;
      }

      return params[name];
    }

    return null;
  }

  selectFragment(): Observable<string> {
    return this.select().pipe(slice('fragment'), distinctUntilChanged());
  }

  getFragment(): string | null {
    if (this.getValue().state) {
      return this.getValue().state!.root.fragment;
    }

    return null;
  }

  selectData<T = string>(name: string): Observable<T>;
  selectData<T = string>(): Observable<HashMap<T>>;
  selectData<T = string>(name?: string): Observable<T | HashMap<T>> {
    if (name === undefined) {
      return this.select().pipe(slice('data'), distinctUntilChanged());
    }

    return this.select().pipe(
      slice('data'),
      pluck(name),
      distinctUntilChanged()
    );
  }

  getData<T = string>(name: string): T | null;
  getData<T>(): Data | null;
  getData<T>(name?: string): Data | null {
    if (this.getValue().state) {
      const data = this.getValue().state!.root.data;
      if (name === undefined) {
        return data;
      }

      return data[name];
    }

    return null;
  }
}
