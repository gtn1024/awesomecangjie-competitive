---
oj: dmy
pid: '163'
title: '[R27C]服务窗口'
difficulty: 提高
tags:
  - 模拟
  - 排序
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^5$，$1 \le T_i, a_i \le 10^9$。输入不保证按 $T_i$ 排序。

## 思路

两窗口、一个等候队列的事件模拟。关键有三条规则要同时满足：到达即判断（有空窗立即服务，两窗都空选 1 号）、窗口完成时队首立即接入、同时空出且队首存在时选 1 号窗口。

先把客户按 $(T_i, \text{原序})$ 升序排序，得到处理顺序。维护两个窗口的「空闲时刻」 $w_1, w_2$（初始为 $0$，表示一开始就空闲），以及一个 FIFO 等候队列。

核心是一个 `drainQueue(limit)` 过程：只要队列非空，就取出**最早空闲**的窗口（若 $w_1 \le w_2$ 选 1 号，保证同时空出时选 1 号），若其空闲时刻 $f \le limit$，则队首客户在 $f$ 时刻开始服务，离开时刻为 $f + a$，并把这个窗口的空闲时刻更新为 $f + a$；若 $f > limit$ 则停下。该过程把「窗口空出 → 立即接队首」这条规则一次性消化干净。

对每个按到达顺序处理的客户 $c$（到达时刻 $T_c$）：

1. 先调用 `drainQueue(T_c)`，处理在 $T_c$ 之前空出的窗口（让排队的客户先就位）；
2. 此时若仍有窗口空闲（$w_1 \le T_c$ 优先 1 号，否则 $w_2 \le T_c$），客户立刻在该窗口开始服务，离开时刻为 $T_c + a$，对应窗口空闲时刻更新为 $T_c + a$；
3. 否则两个窗口都在忙，客户入队。

所有到达处理完后，再以一个极大值作为 limit 调用一次 `drainQueue`，把队列里剩余的客户依次送入空出的窗口。

注意区分两种开始时刻：到达时直接占用空闲窗口，客户在到达时刻 $T_c$ 开始服务；从队列中被接走，客户在窗口空闲时刻 $f$ 开始服务（因为窗口一空出就立刻接入，不会等待）。

## 复杂度

时间 $O(n \log n)$（排序）加 $O(n)$（每个客户入队、出队各一次），空间 $O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*
import std.sort.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    // 客户信息
    let T = Array<Int64>(n, { _ => 0 })
    let a = Array<Int64>(n, { _ => 0 })
    let idx = Array<Int64>(n, { _ => 0 })
    for (i in 0..n) {
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        T[i] = Int64.parse(parts[0])
        a[i] = Int64.parse(parts[1])
        idx[i] = i
    }
    // 排序下标：按 (T, idx) 升序，处理时即按到达顺序
    let ord = Array<Int64>(n, { i: Int64 => i })
    sort(
        ord,
        lessThan: { l: Int64, r: Int64 =>
            if (T[l] != T[r]) {
                return T[l] < T[r]
            }
            return idx[l] < idx[r]
        }
    )

    let leave = Array<Int64>(n, { _ => 0 })

    var w1: Int64 = 0   // 窗口 1 空闲时刻
    var w2: Int64 = 0   // 窗口 2 空闲时刻
    // 等候队列（存 ord 中的索引，即到达处理顺序序号）
    var qh: Int64 = 0
    let qt = Array<Int64>(n + 1, { _ => 0 })
    var qtlen: Int64 = 0

    // 处理时刻 <= limit 的窗口空出事件：空出的窗口立即接队列队首；
    // 选最早空闲的窗口，同时空出选 1 号
    func drainQueue(limit: Int64): Unit {
        while (qtlen - qh > 0) {
            var useW1: Bool = (w1 <= w2)
            let f: Int64 = if (useW1) { w1 } else { w2 }
            if (f > limit) {
                break
            }
            let ordPos = ord[qt[qh]]
            qh += 1
            let lv = f + a[ordPos]
            if (useW1) {
                w1 = lv
            } else {
                w2 = lv
            }
            leave[idx[ordPos]] = lv
        }
    }

    // 逐个到达的客户
    for (oi in 0..n) {
        let ordPos = ord[oi]
        let tc = T[ordPos]
        // 先处理时刻 <= tc 的窗口空出（接队列）
        drainQueue(tc)
        // 判断是否有空闲窗口；两窗都空选 1 号
        if (w1 <= tc) {
            let lv = tc + a[ordPos]
            w1 = lv
            leave[idx[ordPos]] = lv
        } else if (w2 <= tc) {
            let lv = tc + a[ordPos]
            w2 = lv
            leave[idx[ordPos]] = lv
        } else {
            // 两个窗口都忙，排队
            qt[qtlen] = oi
            qtlen += 1
        }
    }
    // 收尾：剩余队列按窗口空出顺序处理
    drainQueue(9223372036854775807)

    let sb = StringBuilder()
    for (i in 0..n) {
        sb.append(leave[i])
        sb.append("\n")
    }
    print(sb.toString())
    return 0
}
```
