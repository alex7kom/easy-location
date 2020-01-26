interface LocationData {
  path: string[];
  search: {
    [key: string]: string;
  }
}

interface EasyLocation {
  reflect: (locationData: Partial<LocationData>) => void;
  unmount: () => void;
}

interface EasyLocationOpts {
  onChange?: (locationData: LocationData) => void;
  onNewUrl?: (url: string) => void;
}

declare function initEasyLocation(opts: EasyLocationOpts): EasyLocation;

export = initEasyLocation;
