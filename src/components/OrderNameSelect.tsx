"use client";
import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllOrders } from "@/hooks/useOrder";

export function OrderNameSelect() {
  const { data } = useAllOrders();
  return (
    <Select >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a order" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup >
          <SelectLabel>Orders</SelectLabel>
          {data?.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.order_name}
            </SelectItem>
          ))}
          {/* <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="grapes">Grapes</SelectItem>
          <SelectItem value="pineapple">Pineapple</SelectItem> */}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
