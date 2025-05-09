import { Canvas } from 'canvas';
import Table2canvas, { IColumn } from 'table2canvas';
import fs from 'fs';
import { AttachmentBuilder } from 'discord.js';

const columns = [
    {
        title: 'name',
        children: [
            {
                title: 'first',
                dataIndex: 'first'
            },
            {
                title: 'last',
                dataIndex: 'last',
                render: (text: string, row: any, i: number) => {
                    if (i === 0) {
                        return { text, rowSpan: 3 }
                    }
                    if (i === 1) {
                        return { text, rowSpan: 0 }
                    }
                    if (i === 2) {
                        return { text, rowSpan: 0 }
                    }
                    return text;
                }
            }
        ]
    },
    { title: 'age', dataIndex: 'age', textAlign: 'center', textColor: 'blue' },
    { title: 'weight', dataIndex: 'weight', render: '{c}kg' },
    { title: 'address', dataIndex: 'address', width: 200 },
    {
        title: 'other-abcd',
        children: [
            {
                title: 'a',
                dataIndex: 'a',
                render: (text: string, row: any, i: number) => {
                    if (i === 2) {
                        return { text, colSpan: 2, rowSpan: 2 }
                    }
                    if (i === 3) {
                        return { text, colSpan: 0, rowSpan: 0 }
                    }
                    return text;
                }
            },
            {
                title: 'b',
                dataIndex: 'b',
                render: (text: string, row: any, i: number) => {
                    if (i === 2 || i === 3) {
                        return { text, colSpan: 0, rowSpan: 0 }
                    }
                    return text;
                }
            },
            {
                title: 'c+d',
                children: [
                    {
                        title: 'c',
                        dataIndex: 'c'
                    },
                    {
                        title: 'd',
                        dataIndex: 'd'
                    }
                ]
            }
        ]
    }
]

const dataSource: any[] = [
    { first: 'Jack', last: 'smith', age: 16, weight: 50, address: '1.somewhere\n2.somewhere', a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
    { first: 'Jack', last: 'smith', age: 26, weight: 60, address: 'street9527123456789no.,it is a to long adress!', a: 'a2', b: 'b2', c: 'c2', d: 'd2' },
    { first: 'Jack', last: 'last', age: 36, weight: 70, address: 'where', a: 'merge-a+b\nline2\nline3', b: 'merge-a+b', c: 'c3', d: 'd3' },
    { first: 'Tom', last: 'last', age: 46, weight: 80, address: 'where', a: 'merge-a+b', b: 'merge-a+b', c: 'c4', d: 'd4' },
]

export const canvasTable = (title: string) => {
  const table = new Table2canvas({
    canvas: new Canvas(2, 2),
    columns: columns as IColumn<any>[],
    dataSource: dataSource,
    bgColor: '#fff',
    text: title,
})

const buffer = table.canvas.toBuffer();

  const file = new AttachmentBuilder(buffer, { name: 'table.png', description: 'This is a table' });
  
  return file;
}

