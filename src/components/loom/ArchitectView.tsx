'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfitDials from './architect-view/ProfitDials';
import GroqSwarmWeave from './architect-view/GroqSwarmWeave';
import CovenantOrrery from './architect-view/CovenantOrrery';

export default function ArchitectView() {
    return (
        <div className="w-full h-full p-4">
             <Tabs defaultValue="dials" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="dials">Profit Dials</TabsTrigger>
                    <TabsTrigger value="weave">The Weave</TabsTrigger>
                    <TabsTrigger value="orrery">The Orrery</TabsTrigger>
                </TabsList>
                <TabsContent value="dials" className="flex-grow mt-2">
                    <ProfitDials />
                </TabsContent>
                <TabsContent value="weave" className="flex-grow mt-2">
                    <GroqSwarmWeave />
                </TabsContent>
                <TabsContent value="orrery" className="flex-grow mt-2">
                    <CovenantOrrery />
                </TabsContent>
            </Tabs>
        </div>
    )
}
