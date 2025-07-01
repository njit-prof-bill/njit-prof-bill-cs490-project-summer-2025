// src/components/profile/ContactInfoSection.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Mail, Phone, Plus, X } from "lucide-react";
import { useProfile, ContactInfo } from "@/context/profileContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const ContactInfoSection: React.FC = () => {
  // pull out your actual context API
  const { activeProfile: profile, updateContactInfo } = useProfile();
  const [showAdditionalEmails, setShowAdditionalEmails] = useState(false);
  const [showAdditionalPhones, setShowAdditionalPhones] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ContactInfo>({
    defaultValues: profile.contactInfo,
  });

  const additionalEmails = watch("additionalEmails") || [];
  const additionalPhones = watch("additionalPhones") || [];

  const onSubmit = (data: ContactInfo) => {
    // this will merge into profile.contactInfo
    updateContactInfo(data);
  };

  const addAdditionalEmail = () => {
    const newEmails = [...(profile.contactInfo.additionalEmails || []), ""];
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
    const newPhones = [...(profile.contactInfo.additionalPhones || []), ""];
    updateContactInfo({ additionalPhones: newPhones });
    setValue("additionalPhones", newPhones);
  };

  const removeAdditionalPhone = (index: number) => {
    const newPhones = additionalPhones.filter((_, i) => i !== index);
    updateContactInfo({ additionalPhones: newPhones });
    setValue("additionalPhones", newPhones);
  };

  const updateAdditionalPhone = (index: number, value: string) => {
    const newPhones = [...additionalPhones];
    newPhones[index] = value;
    updateContactInfo({ additionalPhones: newPhones });
    setValue("additionalPhones", newPhones);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Contact Information
        </h2>
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
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              type="email"
              className="pl-10"
              placeholder="your.email@example.com"
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
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              {...register("phone", { required: "Phone number is required" })}
              type="tel"
              className="pl-10"
              placeholder="(555) 123-4567"
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
                  <div className="flex-1 relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => updateAdditionalPhone(i, e.target.value)}
                      className="pl-10"
                      placeholder="(555) 987-6543"
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
