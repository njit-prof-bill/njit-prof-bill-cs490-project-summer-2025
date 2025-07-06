"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Mail, Phone, Plus, X } from "lucide-react";
import { useProfile, ContactInfo } from "@/context/profileContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { countries } from "@/lib/countries";


const ContactInfoSection: React.FC = () => {
  const { activeProfile: profile, updateContactInfo } = useProfile();
  const [showAdditionalEmails, setShowAdditionalEmails] = useState(false);
  const [showAdditionalPhones, setShowAdditionalPhones] = useState(false);

  const [primaryCountryCode, setPrimaryCountryCode] = useState("+1"); // Default US
  const [additionalCountryCodes, setAdditionalCountryCodes] = useState<string[]>(
    (profile.contactInfo.additionalPhones || []).map(() => "+1")
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    clearErrors,
  } = useForm<ContactInfo>({
    defaultValues: profile.contactInfo,
  });

  const additionalEmails = watch("additionalEmails") || [];
  const additionalPhones = watch("additionalPhones") || [];

  // Auto-detect country code from loaded phone
  useEffect(() => {
    const phone = profile.contactInfo?.phone || "";
    if (!phone) return;

    let normalized = phone.replace(/\s+/g, "").replace(/[^0-9+]/g, "");
    let found = false;

    if (normalized.startsWith("+")) {
      for (const country of countries) {
        if (normalized.startsWith(country.code)) {
          setPrimaryCountryCode(country.code);
          const local = normalized.slice(country.code.length).replace(/^0+/, "");
          setValue("phone", local);
          found = true;
          break;
        }
      }
    }

    if (!found) {
      setPrimaryCountryCode("+1");
      setValue("phone", normalized);
    }
  }, [profile.contactInfo?.phone, setValue]);

  const onSubmit = (data: ContactInfo) => {
    const fullPhone = `${primaryCountryCode}${data.phone}`;
    const fullAdditionalPhones = additionalPhones.map((p, i) => {
      return `${additionalCountryCodes[i]}${p}`;
    });
    updateContactInfo({
      ...data,
      phone: fullPhone,
      additionalPhones: fullAdditionalPhones,
    });
  };

  const addAdditionalEmail = () => {
    const newEmails = [...additionalEmails, ""];
    updateContactInfo({ additionalEmails: newEmails });
    setValue("additionalEmails", newEmails);
  };

  const removeAdditionalEmail = (index: number) => {
    const newEmails = additionalEmails.filter((_, i) => i !== index);
    updateContactInfo({ additionalEmails: newEmails });
    setValue("additionalEmails", newEmails);
  };

  const updateAdditionalEmail = (index: number, value: string) => {
    const newEmails = [...additionalEmails];
    newEmails[index] = value;
    updateContactInfo({ additionalEmails: newEmails });
    setValue("additionalEmails", newEmails);
  };

  const addAdditionalPhone = () => {
    const newPhones = [...additionalPhones, ""];
    const newCodes = [...additionalCountryCodes, "+1"];
    updateContactInfo({ additionalPhones: newPhones });
    setValue("additionalPhones", newPhones);
    setAdditionalCountryCodes(newCodes);
  };

  const removeAdditionalPhone = (index: number) => {
    const newPhones = additionalPhones.filter((_, i) => i !== index);
    const newCodes = additionalCountryCodes.filter((_, i) => i !== index);
    updateContactInfo({ additionalPhones: newPhones });
    setValue("additionalPhones", newPhones);
    setAdditionalCountryCodes(newCodes);
  };

  const updateAdditionalPhone = (index: number, value: string) => {
    let cleaned = value.trim();

    if (cleaned.startsWith("+")) {
      const found = countries.find((c) => cleaned.startsWith(c.code));
      if (found) {
        const newCodes = [...additionalCountryCodes];
        newCodes[index] = found.code;
        setAdditionalCountryCodes(newCodes);

        cleaned = cleaned.slice(found.code.length).replace(/^0+/, "");
      }
    }

    const newPhones = [...additionalPhones];
    newPhones[index] = cleaned;
    updateContactInfo({ additionalPhones: newPhones });
    setValue("additionalPhones", newPhones);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Contact Information</h2>
        <p className="text-muted-foreground">
          Manage your contact details and communication preferences
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Primary Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Primary Email Address *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              className="pl-10"
              placeholder="your.email@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              onChange={(e) => {
                setValue("email", e.target.value);
                if (errors.email) clearErrors("email");
              }}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Additional Emails */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Additional Email Addresses</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdditionalEmails((v) => !v)}
            >
              {showAdditionalEmails ? "Hide" : "Show"} Additional Emails
            </Button>
          </div>
          {showAdditionalEmails && (
            <div className="space-y-2">
              {additionalEmails.map((email, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => updateAdditionalEmail(i, e.target.value)}
                      className="pl-10"
                      placeholder="additional.email@example.com"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAdditionalEmail(i)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAdditionalEmail}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Email
              </Button>
            </div>
          )}
        </div>

        {/* Primary Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">Primary Phone Number *</Label>
          <div className="relative flex">
            <select
              value={primaryCountryCode}
              onChange={(e) => setPrimaryCountryCode(e.target.value)}
              className="
                rounded-l
                border
                border-gray-300
                bg-gray-50
                text-gray-700
                dark:bg-zinc-800
                dark:text-white
                dark:border-zinc-700
                px-2
                focus:outline-none
              "
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.emoji} {country.label} ({country.code})
                </option>
              ))}
            </select>
            <Input
              type="tel"
              className="rounded-l-none"
              placeholder={
                primaryCountryCode === "+1" ? "(555) 123-4567" : "Enter phone number"
              }
              {...register("phone", {
                required: "Phone number is required",
                validate: (value) => {
                  const digits = value.replace(/\D/g, "");
                  if (digits.length < 7) return "Phone number must have at least 7 digits";
                  if (digits.length > 15) return "Phone number must have at most 15 digits";
                  return true;
                },
              })}
              onChange={(e) => {
                let value = e.target.value.trim();

                if (value.startsWith("+")) {
                  const found = countries.find((c) => value.startsWith(c.code));
                  if (found) {
                    setPrimaryCountryCode(found.code);
                    value = value.slice(found.code.length).replace(/^0+/, "");
                  }
                }

                setValue("phone", value);
                if (errors.phone) clearErrors("phone");
              }}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        {/* Additional Phones */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Additional Phone Numbers</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdditionalPhones((v) => !v)}
            >
              {showAdditionalPhones ? "Hide" : "Show"} Additional Phones
            </Button>
          </div>
          {showAdditionalPhones && (
            <div className="space-y-2">
              {additionalPhones.map((phone, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="flex relative w-full">
                    <select
                      value={additionalCountryCodes[i]}
                      onChange={(e) => {
                        const newCodes = [...additionalCountryCodes];
                        newCodes[i] = e.target.value;
                        setAdditionalCountryCodes(newCodes);
                      }}
                      className="
                        rounded-l
                        border
                        border-gray-300
                        bg-gray-50
                        text-gray-700
                        dark:bg-zinc-800
                        dark:text-white
                        dark:border-zinc-700
                        px-2
                        focus:outline-none
                      "
                    >
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.emoji} {country.label} ({country.code})
                        </option>
                      ))}
                    </select>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => updateAdditionalPhone(i, e.target.value)}
                      className="rounded-l-none"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAdditionalPhone(i)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAdditionalPhone}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Phone
              </Button>
            </div>
          )}
        </div>

        <Button type="submit" className="w-full">
          Update Contact Information
        </Button>
      </form>
    </motion.div>
  );
};

export default ContactInfoSection;
