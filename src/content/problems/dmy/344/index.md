---
oj: dmy
pid: '344'
title: '[R55D]卡牌游戏'
difficulty: 提高
tags:
  - 模拟
  - 链表
timeLimit: 2s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1 \leq k \leq n \leq 5 \times 10^5$，$1 \leq a_i \leq 5 \times 10^5$。

## 思路

按回合顺序模拟即可。桌面的牌是一个支持「按值定位」「从某位置向右删除至多 $k$ 张」的动态序列。

**关键观察**：每当一张牌要被放上桌面时，先检查桌面是否已有相同数字的牌。由于桌面上一旦出现重复值就会立即触发消除，所以 **桌面上同一数字的牌至多只有一张**，用一个哈希表 `值 -> 桌面节点下标` 即可 $O(1)$ 定位。

每回合处理抽出的第 $i$ 张牌 $a_i$：

1. 若哈希表中**没有** $a_i$：把 $a_i$（带原序号 $i$）作为新节点接到桌面链表尾部，并在哈希表登记 `a_i -> 该节点`。
2. 若哈希表中**已有** $a_i$：当前抽出的牌作为触发器直接丢弃（不计消除回合）；从哈希表里取出桌面那张同值牌的位置 $p$，沿链表 `next` 指针从 $p$ 开始连续删除 **至多 $k$ 个** 节点。每删一个就把它的原序号对应的 `ans` 标记为当前回合 $i$，并从哈希表中移除该值。删除时同步维护前驱、后继以及链表头尾指针。

桌面用**数组模拟的双向链表**（`pre`、`next`、`vval`、`vidx` 四个数组，下标即节点编号）维护，删除/拼接都是 $O(1)$。由于每张牌在它生命周期内最多被「放上桌面」一次、被「删除」一次，整体时间复杂度为 $O(n)$。

## 复杂度

- 时间：$O(n)$，每张牌进出桌面各一次。
- 空间：$O(n)$，用于链表数组、哈希表与答案数组。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*
import std.collection.*

main() {
    let reader = getStdIn()
    let line1 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = line1[0]
    let k = line1[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    // 数组模拟双向链表（桌面节点）
    var pre = Array<Int64>(n, { _ => -1 })
    var nxt = Array<Int64>(n, { _ => -1 })
    var vval = Array<Int64>(n, { _ => 0 })
    var vidx = Array<Int64>(n, { _ => 0 })
    var head: Int64 = -1
    var tail: Int64 = -1
    var nodeCnt: Int64 = 0

    // 值 -> 桌面节点下标（桌面每个值最多一张）
    var map = HashMap<Int64, Int64>()
    var ans = Array<Int64>(n, { _ => 0 })

    var i: Int64 = 0
    while (i < n) {
        let v = a[i]
        match (map.get(v)) {
            case Some(p) =>
                // 触发器丢弃，ans[i] 保持 0
                var cur = p
                var j: Int64 = 0
                while (j < k && cur != -1) {
                    ans[vidx[cur]] = i + 1
                    map.remove(vval[cur])
                    let nx = nxt[cur]
                    let pr = pre[cur]
                    if (pr != -1) {
                        nxt[pr] = nx
                    }
                    if (nx != -1) {
                        pre[nx] = pr
                    }
                    if (head == cur) {
                        head = nx
                    }
                    if (tail == cur) {
                        tail = pr
                    }
                    cur = nx
                    j += 1
                }
            case None =>
                let nd = nodeCnt
                nodeCnt += 1
                vval[nd] = v
                vidx[nd] = i
                pre[nd] = tail
                nxt[nd] = -1
                if (tail != -1) {
                    nxt[tail] = nd
                } else {
                    head = nd
                }
                tail = nd
                map.add(v, nd)
        }
        i += 1
    }

    var first = true
    for (x in ans) {
        if (first) {
            first = false
        } else {
            print(" ")
        }
        print(x)
    }
    println()
}
```
