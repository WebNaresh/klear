import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/form";
import { loadGoogleMapsApi } from "../../../lib/google-maps";
import { cn } from "../../../lib/utils";
import { MapPin } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import {
  ControllerRenderProps,
  FieldValues,
  useFormContext,
} from "react-hook-form";
import PlacesAutocomplete, {
  geocodeByPlaceId,
  Suggestion,
} from "react-places-autocomplete";
import Select from "react-select";
import { UIInputFieldProps } from "../../../InputField";

// Add global styles for the Select menu z-index
const globalStyles = `
  .address-select [class*="-menu"] {
    z-index: 2147483647 !important;
  }
  .address-select [class*="-menuPortal"] {
    z-index: 2147483647 !important;
  }
  .address-select [class*="-option"] {
    z-index: 2147483647 !important;
    pointer-events: auto !important;
  }
`;

// Inject global styles
if (
  typeof document !== "undefined" &&
  !document.getElementById("address-select-styles")
) {
  const style = document.createElement("style");
  style.id = "address-select-styles";
  style.textContent = globalStyles;
  document.head.appendChild(style);
}

type Props = {
  field: ControllerRenderProps<FieldValues, string>;
  inputProps: UIInputFieldProps;
};
interface PlaceOption {
  description: string;
  placeId: string;
}

// Geolocation states
type LocationState =
  | "idle"
  | "requesting"
  | "detecting"
  | "geocoding"
  | "success"
  | "error"
  | "denied";

const AddressInput = ({ field, inputProps }: Props) => {
  const {
    label,
    placeholder,
    className,
    required = false,
    autoDetectLocation = false,
  } = inputProps;
  const [apiLoaded, setApiLoaded] = useState(false);
  const form = useFormContext();

  // Location detection states - simplified for silent operation
  const [locationState, setLocationState] = useState<LocationState>("idle");
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);

  // Get form errors for nested fields
  const getNestedError = (obj: any, path: string) => {
    const keys = path.split(".");
    let current = obj;
    for (const key of keys) {
      if (current?.[key] === undefined) return undefined;
      current = current[key];
    }
    return current?.message;
  };

  const formError = getNestedError(form?.formState.errors, field.name);
  // Try to get nested address error if this is a parent field (e.g., location.address)
  const addressError = getNestedError(
    form?.formState.errors,
    `${field.name}.address`
  );

  // Geolocation detection function - only available when autoDetectLocation is true
  const handleAutoLocation = useCallback(async () => {
    if (!autoDetectLocation) {
      console.warn(
        "Auto geolocation detection is disabled for this input field."
      );
      return;
    }

    if (!apiLoaded) {
      console.error("Maps API not loaded yet. Cannot detect location.");
      return;
    }

    setLocationState("requesting");
    setHasRequestedLocation(true);

    try {
      // Request geolocation permission
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser."));
            return;
          }

          setLocationState("detecting");

          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000, // 5 minutes
          });
        }
      );

      setLocationState("geocoding");

      // Reverse geocode the coordinates
      const geocoder = new window.google.maps.Geocoder();
      const results = await new Promise<google.maps.GeocoderResult[]>(
        (resolve, reject) => {
          geocoder.geocode(
            {
              location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
            },
            (results, status) => {
              if (status === "OK" && results && results.length > 0) {
                resolve(results);
              } else {
                reject(new Error("Failed to get address from coordinates"));
              }
            }
          );
        }
      );

      // Update the form field with the detected location
      const address = results[0].formatted_address;
      const location = results[0].geometry.location;

      field.onChange({
        address: address,
        position: {
          lat: location.lat(),
          lng: location.lng(),
        },
      });

      // Update the state to show the selected address
      setState([
        {
          id: "detected-location",
          active: false,
          index: 0,
          formattedSuggestion: {
            mainText: address.split(",")[0] || address,
            secondaryText: address.split(",").slice(1).join(",").trim() || "",
          },
          description: address,
          placeId: results[0].place_id || "",
          matchedSubstrings: [],
          terms: [],
          types: [],
        },
      ]);

      setLocationState("success");
    } catch (error: any) {
      // Silent failure - no error handling, logging, or user notifications
      setLocationState("idle");
    }
  }, [apiLoaded, field, autoDetectLocation]);

  // Load Google Maps API on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if API is already loaded
      if (window.google && window.google.maps) {
        setApiLoaded(true);
        return;
      }

      // Load API
      loadGoogleMapsApi()
        .then(() => {
          setApiLoaded(true);
        })
        .catch(() => {
          // Silent failure - no error logging or user notifications
        });
    }
  }, []);

  // Auto-detect location when component mounts if autoDetectLocation is true
  useEffect(() => {
    if (
      autoDetectLocation &&
      apiLoaded &&
      !field.value?.address &&
      !hasRequestedLocation &&
      locationState === "idle"
    ) {
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        handleAutoLocation();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [
    autoDetectLocation,
    apiLoaded,
    field.value?.address,
    hasRequestedLocation,
    locationState,
    handleAutoLocation,
  ]);

  // Fix cursor positioning in React Select
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      .address-select .react-select__control {
        padding-left: 2.5rem !important;
      }
      .address-select .react-select__value-container {
        padding-left: 0 !important;
        margin-left: 0 !important;
      }
      .address-select .react-select__input-container {
        margin: 0 !important;
        padding: 0 !important;
      }
      .address-select .react-select__input {
        margin: 0 !important;
        padding: 0 !important;
      }
      .address-select .react-select__input input {
        padding-left: 0 !important;
        margin-left: 0 !important;
        text-indent: 0 !important;
      }
      .address-select .react-select__placeholder {
        margin-left: 0 !important;
        padding-left: 0 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const customStyles = {
    menu: (provided: any) => {
      const menuStyles = {
        ...provided,
        zIndex: 2147483647, // Maximum safe integer for z-index
        backgroundColor: "hsl(var(--background))",
        border: "1px solid hsl(var(--border))",
        borderRadius: "var(--radius)",
        maxWidth: "400px",
        width: "100%",
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        pointerEvents: "auto",
      };
      return menuStyles;
    },
    menuPortal: (provided: any) => {
      const portalStyles = {
        ...provided,
        zIndex: 2147483647,
        pointerEvents: "auto",
      };
      return portalStyles;
    },
    option: (provided: any, state: any) => {
      const optionStyles = {
        ...provided,
        backgroundColor: state.isSelected
          ? "hsl(var(--primary))"
          : state.isFocused
          ? "hsl(var(--accent))"
          : "transparent",
        color: state.isSelected
          ? "hsl(var(--primary-foreground))"
          : "hsl(var(--foreground))",
        cursor: "pointer",
        whiteSpace: "normal",
        wordWrap: "break-word",
        padding: "8px 12px",
        pointerEvents: "auto",
        zIndex: 2147483647,
      };
      return optionStyles;
    },
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: "transparent",
      border: `1px solid ${
        formError ? "hsl(var(--destructive))" : "hsl(var(--input))"
      }`,
      borderRadius: "var(--radius)",
      minHeight: "44px",
      paddingLeft: "0.5rem",
      display: "flex",
      alignItems: "center",
      width: "100%",
      maxWidth: "100%",
      "&:hover": {
        borderColor: formError
          ? "hsl(var(--destructive))"
          : "hsl(var(--input))",
      },
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      paddingLeft: "0",
      overflow: "hidden",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      overflow: "hidden",
      maxWidth: "100%",
    }),
    input: (provided: any) => {
      const inputStyle = {
        ...provided,
        paddingLeft: "0",
        margin: "0",
        color: "hsl(var(--foreground))",
      };
      return inputStyle;
    },
    placeholder: (provided: any) => {
      const placeholderStyle = {
        ...provided,
        color: "hsl(var(--muted-foreground))",
        paddingLeft: "0",
      };
      return placeholderStyle;
    },
  };

  const handleSelect = async (
    option: PlaceOption,
    onChange: (value: any) => void
  ) => {
    if (!option?.placeId) {
      if (option?.placeId === "") {
        // Empty selection - clear the field
        onChange({
          address: "",
          position: {
            lat: 0,
            lng: 0,
          },
        });
      } else {
        // No valid option selected
        onChange({
          address: undefined,
          position: {
            lat: 0,
            lng: 0,
          },
        });
      }
    } else {
      try {
        const response = await geocodeByPlaceId(option.placeId);

        if (response && response[0]) {
          onChange({
            address: response[0].formatted_address,
            position: response[0].geometry?.location?.toJSON() || {
              lat: 0,
              lng: 0,
            },
          });
        } else {
          // Fallback: use the description from the option
          onChange({
            address: option.description,
            position: {
              lat: 0,
              lng: 0,
            },
          });
        }
      } catch (error) {
        console.warn("Geocoding error:", error);
        // Fallback: use the description from the option
        onChange({
          address: option.description,
          position: {
            lat: 0,
            lng: 0,
          },
        });
      }
    }
  };

  const [state, setState] = useState<Suggestion[]>([
    field?.value?.address && {
      id: "initial-id",
      active: false,
      index: 0,
      formattedSuggestion: field?.value?.address ?? "",
      description: field?.value?.address ?? "",
      placeId: "",
      matchedSubstrings: [], // Provide appropriate default value
      terms: [], // Provide appropriate default value
      types: [], // Provide appropriate default value
      // other properties with default values...
    },
  ]);
  const [value, setValue] = useState<string>("");
  const [allowManualInput, setAllowManualInput] = useState<boolean>(false);
  const handleFieldChange1 = field.onChange;
  const handleFieldChange = useCallback(
    (newValue: any) => {
      handleFieldChange1(newValue);

      // react-hooks/exhaustive-deps
    },
    [handleFieldChange1] // Only recreate if 'field' changes
  );

  useEffect(() => {
    if (state.length === 0) {
      handleFieldChange({
        address: undefined,
        position: {
          lat: 0,
          lng: 0,
        },
      });
    } else {
      handleSelect(state[0], handleFieldChange);
    }
  }, [state, handleFieldChange]);

  // Don't render Places Autocomplete until API is loaded
  if (!apiLoaded) {
    return (
      <FormItem
        className={cn(
          "w-full max-w-[400px] min-w-0",
          "group transition-all duration-300 ease-in-out",
          className
        )}
      >
        <FormLabel
          className={cn(
            "text-sm font-medium",
            "transition-colors duration-200",
            "group-hover:text-primary",
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}
        >
          {label}
        </FormLabel>
        <FormControl>
          <div className="relative w-full">
            <div className="absolute top-3 left-3 z-10 search-icon">
              <MapPin className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </div>
            <div className="h-11 w-full border border-input rounded-md bg-transparent relative flex items-center pl-10">
              <span className="text-sm text-muted-foreground">
                Loading maps...
              </span>
            </div>
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  }

  return (
    <FormItem
      className={cn(
        "w-full max-w-[400px] min-w-0",
        "group transition-all duration-300 ease-in-out",
        className
      )}
      style={{ position: "relative", zIndex: 1 }}
    >
      <FormLabel
        className={cn(
          "text-sm font-medium",
          "transition-colors duration-200",
          "group-hover:text-primary",
          required && "after:content-['*'] after:ml-0.5 after:text-red-500"
        )}
      >
        {label}
      </FormLabel>
      <FormControl>
        <div className="relative w-full min-w-0 overflow-hidden">
          <div className="absolute top-3 left-3 z-10 search-icon">
            <MapPin className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          </div>
          {/* Custom placeholder positioned after the icon */}
          {!state[0] && !value && (
            <div className="absolute top-3 left-13 text-muted-foreground pointer-events-none z-5">
              {allowManualInput
                ? "Type address manually or search..."
                : placeholder || "Enter business address"}
            </div>
          )}
          <PlacesAutocomplete
            value={value}
            onChange={(value) => {
              setValue(value);
            }}
            searchOptions={{
              types: [],
              componentRestrictions: { country: ["in"] },
            }}
            onError={(status, clearSuggestions) => {
              // Clear suggestions on error to prevent hanging state
              clearSuggestions();
              // Enable manual input as fallback
              setAllowManualInput(true);
            }}
            debounce={300}
          >
            {({ getInputProps, suggestions, loading }) => {
              return (
                <Select
                  styles={{
                    ...customStyles,
                    control: (base, state) => {
                      const controlStyle = {
                        ...customStyles.control(base, state),
                        backgroundColor: "transparent",
                        border: `1px solid ${
                          formError || addressError
                            ? "hsl(var(--destructive))"
                            : "hsl(var(--input))"
                        }`,
                        borderRadius: "var(--radius)",
                        minHeight: "44px",
                        paddingLeft: "2.5rem",
                        width: "100%",
                        maxWidth: "100%",
                        minWidth: 0,
                        overflow: "hidden",
                        "&:hover": {
                          borderColor:
                            formError || addressError
                              ? "hsl(var(--destructive))"
                              : "hsl(var(--input))",
                        },
                      };
                      return controlStyle;
                    },
                    valueContainer: (provided) => {
                      const containerStyle = {
                        ...customStyles.valueContainer(provided),
                        paddingLeft: "0",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                      };
                      return containerStyle;
                    },
                    singleValue: (provided) => ({
                      ...customStyles.singleValue(provided),
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      maxWidth: "calc(100% - 20px)",
                    }),
                    input: (provided) => ({
                      ...customStyles.input(provided),
                    }),
                    placeholder: (provided) => ({
                      ...customStyles.placeholder(provided),
                    }),
                  }}
                  isLoading={loading}
                  placeholder=""
                  components={{
                    IndicatorSeparator: () => null,
                  }}
                  value={state[0]}
                  escapeClearsValue={false}
                  options={suggestions}
                  getOptionLabel={(option: Suggestion) => option.description}
                  getOptionValue={(option: Suggestion) => option.placeId}
                  onInputChange={(inputValue: string, actionMeta: any) => {
                    // Handle manual input when API fails
                    if (
                      allowManualInput &&
                      actionMeta?.action === "input-change"
                    ) {
                      // Allow manual typing and treat it as address
                      handleFieldChange({
                        address: inputValue,
                        position: {
                          lat: 0,
                          lng: 0,
                        },
                      });
                    }

                    // Call the original onInputChange
                    getInputProps().onChange({
                      target: { value: inputValue },
                    });
                  }}
                  filterOption={() => true}
                  onChange={(value: any, actionMeta: any) => {
                    if (value) {
                      setState([value]);
                    } else {
                      setState([]);
                    }
                    // Prevent blur when selecting an option
                    if (actionMeta.action === "select-option") {
                      setTimeout(() => {
                        const input = document.querySelector(
                          ".address-select input"
                        );
                        if (input) {
                          (input as HTMLElement).focus();
                        }
                      }, 0);
                    }
                  }}
                  isClearable={true}
                  isSearchable={true}
                  className="w-full min-w-0 address-select"
                  menuPortalTarget={
                    typeof document !== "undefined" ? document.body : null
                  }
                  menuPlacement="bottom"
                  menuShouldScrollIntoView={false}
                  menuShouldBlockScroll={false}
                  blurInputOnSelect={false}
                  openMenuOnClick={true}
                  openMenuOnFocus={true}
                  closeMenuOnScroll={false}
                />
              ) as any;
            }}
          </PlacesAutocomplete>
        </div>
      </FormControl>

      {/* Manual input mode indicator */}
      {allowManualInput && (
        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
          <span>⚠️</span>
          Location search unavailable. You can type the address manually.
        </p>
      )}

      {/* Show nested address error below the input */}
      {addressError && (
        <p className="text-sm font-medium text-destructive mt-2">
          {addressError}
        </p>
      )}
      {/* Show top-level error if present and not a nested address error */}
      {formError && !addressError && (
        <p className="text-sm font-medium text-destructive mt-2">{formError}</p>
      )}
      <FormMessage />
    </FormItem>
  );
};

export default React.memo(AddressInput);
