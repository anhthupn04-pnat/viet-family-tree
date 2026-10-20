"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Member } from "@/types/family";

export const ROOT_SEED_MEMBERS: Member[] = [
  // Đời 1: Cụ Ông & Cụ Bà
  {
    id: "phan-thanh",
    fullName: "Phan Thạnh",
    nickname: "Cụ Khởi Tổ",
    gender: "male",
    generation: 1,
    birthDate: "12/04/1910",
    deathDate: "04/05/1985",
    isAlive: false,
    spouseId: "tran-thi-hoang",
    notes: "Cụ Khởi Tổ tộc Phan, khai khẩn điền địa và lập nghiệp gia phong.",
  },
  {
    id: "tran-thi-hoang",
    fullName: "Trần Thị Hoàng",
    nickname: "Cụ Bà",
    gender: "female",
    generation: 1,
    birthDate: "18/08/1914",
    deathDate: "10/09/1990",
    isAlive: false,
    spouseId: "phan-thanh",
    notes: "Cụ Bà phối ngẫu cùng Cụ Phan Thạnh, hiền thục phúc hậu.",
  },
  // Đời 2: 9 người con huyết thống từ Cụ Phan Thạnh và Cụ Trần Thị Hoàng
  {
    id: "phan-van-thu-1",
    fullName: "Phan Văn Thứ 1",
    nickname: "Bác Cả",
    gender: "male",
    generation: 2,
    orderInFamily: 1,
    birthDate: "05/02/1935",
    deathDate: "15/07/2010",
    isAlive: false,
    fatherId: "phan-thanh",
    motherId: "tran-thi-hoang",
    notes: "Trưởng nam đời 2 tộc Phan.",
  },
  {
    id: "phan-van-thu-2",
    fullName: "Phan Văn Thứ 2",
    nickname: "Bác Hai",
    gender: "male",
    generation: 2,
    orderInFamily: 2,
    birthDate: "10/11/1937",
    deathDate: "20/12/2015",
    isAlive: false,
    fatherId: "phan-thanh",
    motherId: "tran-thi-hoang",
    notes: "Con thứ 2 tộc Phan.",
  },
  {
    id: "phan-van-thu-3",
    fullName: "Phan Văn Thứ 3",
    nickname: "Bác Ba",
    gender: "male",
    generation: 2,
    orderInFamily: 3,
    birthDate: "15/03/1940",
    isAlive: true,
    fatherId: "phan-thanh",
    motherId: "tran-thi-hoang",
    notes: "Con thứ 3 tộc Phan.",
  },
  {
    id: "phan-van-thu-4",
    fullName: "Phan Văn Thứ 4",
    nickname: "Chú Tư",
    gender: "male",
    generation: 2,
    orderInFamily: 4,
    birthDate: "22/09/1943",
    isAlive: true,
    fatherId: "phan-thanh",
    motherId: "tran-thi-hoang",
    notes: "Con thứ 4 tộc Phan.",
  },
  {
    id: "phan-van-thu-5",
    fullName: "Phan Văn Thứ 5",
    nickname: "Chú Năm",
    gender: "male",
    generation: 2,
    orderInFamily: 5,
    birthDate: "14/06/1946",
    isAlive: true,
    fatherId: "phan-thanh",
    motherId: "tran-thi-hoang",
    notes: "Con thứ 5 tộc Phan.",
  },
  {
    id: "phan-van-thu-6",
    fullName: "Phan Văn Thứ 6",
    nickname: "Cô Sáu",
    gender: "female",
    generation: 2,
    orderInFamily: 6,
    birthDate: "08/01/1949",
    isAlive: true,
    fatherId: "phan-thanh",
    motherId: "tran-thi-hoang",
    notes: "Con thứ 6 tộc Phan.",
  },
  {
    id: "phan-van-thu-7",
    fullName: "Phan Văn Thứ 7",
    nickname: "Chú Bảy",
    gender: "male",
    generation: 2,
    orderInFamily: 7,
    birthDate: "30/04/1952",
    isAlive: true,
    fatherId: "phan-thanh",
    motherId: "tran-thi-hoang",
    notes: "Con thứ 7 tộc Phan.",
  },
  {
    id: "phan-van-thu-8",
    fullName: "Phan Văn Thứ 8",
    nickname: "Cô Tám",
    gender: "female",
    generation: 2,
    orderInFamily: 8,
    birthDate: "19/10/1955",
    isAlive: true,
    fatherId: "phan-thanh",
    motherId: "tran-thi-hoang",
    notes: "Con thứ 8 tộc Phan.",
  },
  {
    id: "phan-van-thu-9",
    fullName: "Phan Văn Thứ 9",
    nickname: "Chú Út",
    gender: "male",
    generation: 2,
    orderInFamily: 9,
    birthDate: "25/12/1958",
    isAlive: true,
    fatherId: "phan-thanh",
    motherId: "tran-thi-hoang",
    notes: "Con thứ 9 (con út) tộc Phan.",
  },
];

const STORAGE_KEY = "phan_family_members_v2";

interface FamilyStoreContextType {
  members: Member[];
  addMember: (memberData: Omit<Member, "id"> & { id?: string }) => Member;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  resetToSeedData: () => void;
  getMember: (id: string) => Member | undefined;
  getChildren: (parentId: string) => Member[];
  getSpouse: (memberId: string) => Member | undefined;
  refreshTrigger: number;
}

const FamilyStoreContext = createContext<FamilyStoreContextType | null>(null);

export function FamilyStoreProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState<Member[]>(ROOT_SEED_MEMBERS);
  const [isInitialized, setIsInitialized] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Initialize from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMembers(parsed);
          setIsInitialized(true);
          return;
        }
      }
      // If no stored data, seed with root data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ROOT_SEED_MEMBERS));
      setMembers(ROOT_SEED_MEMBERS);
    } catch (e) {
      console.warn("Storage load error:", e);
      setMembers(ROOT_SEED_MEMBERS);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage when members state changes
  const saveMembers = useCallback((newMembers: Member[]) => {
    setMembers(newMembers);
    setRefreshTrigger((prev) => prev + 1);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newMembers));
    } catch (e) {
      console.error("Storage save error:", e);
    }
  }, []);

  const addMember = useCallback(
    (memberData: Omit<Member, "id"> & { id?: string }): Member => {
      const newId =
        memberData.id || `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newMember: Member = {
        ...memberData,
        id: newId,
      };

      setMembers((prev) => {
        let updated = [...prev, newMember];

        // If newMember has spouseId, link spouse reciprocally
        if (newMember.spouseId) {
          updated = updated.map((m) =>
            m.id === newMember.spouseId ? { ...m, spouseId: newMember.id } : m
          );
        }

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
        return updated;
      });

      setRefreshTrigger((prev) => prev + 1);
      return newMember;
    },
    []
  );

  const updateMember = useCallback((id: string, updates: Partial<Member>) => {
    setMembers((prev) => {
      let updated = prev.map((m) => (m.id === id ? { ...m, ...updates } : m));

      // Handle spouse reciprocal linking
      if (updates.spouseId) {
        updated = updated.map((m) =>
          m.id === updates.spouseId ? { ...m, spouseId: id } : m
        );
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const deleteMember = useCallback((id: string) => {
    setMembers((prev) => {
      // Remove member and unlink from parents / spouse
      const updated = prev
        .filter((m) => m.id !== id)
        .map((m) => ({
          ...m,
          spouseId: m.spouseId === id ? undefined : m.spouseId,
          fatherId: m.fatherId === id ? undefined : m.fatherId,
          motherId: m.motherId === id ? undefined : m.motherId,
        }));

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const resetToSeedData = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ROOT_SEED_MEMBERS));
    } catch (e) {
      console.error(e);
    }
    setMembers(ROOT_SEED_MEMBERS);
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const getMember = useCallback(
    (id: string) => members.find((m) => m.id === id),
    [members]
  );

  const getChildren = useCallback(
    (parentId: string) =>
      members
        .filter((m) => m.fatherId === parentId || m.motherId === parentId)
        .sort((a, b) => (a.orderInFamily || 99) - (b.orderInFamily || 99)),
    [members]
  );

  const getSpouse = useCallback(
    (memberId: string) => {
      const member = members.find((m) => m.id === memberId);
      if (!member || !member.spouseId) return undefined;
      return members.find((m) => m.id === member.spouseId);
    },
    [members]
  );

  return (
    <FamilyStoreContext.Provider
      value={{
        members,
        addMember,
        updateMember,
        deleteMember,
        resetToSeedData,
        getMember,
        getChildren,
        getSpouse,
        refreshTrigger,
      }}
    >
      {children}
    </FamilyStoreContext.Provider>
  );
}

export function useFamilyStore() {
  const context = useContext(FamilyStoreContext);
  if (!context) {
    throw new Error("useFamilyStore must be used within a FamilyStoreProvider");
  }
  return context;
}
